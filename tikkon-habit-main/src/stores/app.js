import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword
} from 'firebase/auth'
import {
  collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, getDocs, onSnapshot, serverTimestamp, orderBy
} from 'firebase/firestore'
import { auth, db } from '@/firebase'

export const useAppStore = defineStore('app', () => {
  const user = ref(null)
  const userProfile = ref(null)
  const habits = ref([])
  const tasks = ref([])
  const dayLogs = ref({})
  const loading = ref(true)

  function initAuth() {
    onAuthStateChanged(auth, async (u) => {
      user.value = u
      if (u) {
        await loadUserProfile()
        subscribeHabits()
        subscribeTasks()
        subscribeDayLogs()
      } else {
        habits.value = []
        tasks.value = []
        dayLogs.value = {}
      }
      loading.value = false
    })
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function register(email, password, name) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    await setDoc(doc(db, 'users', cred.user.uid), {
      name, email, bio: '', avatar: '', createdAt: serverTimestamp()
    })
  }

  async function logout() {
    await signOut(auth)
  }

  async function loadUserProfile() {
    if (!user.value) return
    const snap = await getDoc(doc(db, 'users', user.value.uid))
    if (snap.exists()) userProfile.value = snap.data()
    else userProfile.value = { name: user.value.displayName, email: user.value.email, bio: '', avatar: '' }
  }

  async function updateUserProfile(data) {
    if (!user.value) return
    await setDoc(doc(db, 'users', user.value.uid), { ...userProfile.value, ...data }, { merge: true })
    if (data.name) await updateProfile(auth.currentUser, { displayName: data.name })
    if (data.email && data.email !== user.value.email) await updateEmail(auth.currentUser, data.email)
    userProfile.value = { ...userProfile.value, ...data }
  }

  async function changePassword(newPassword) {
    await updatePassword(auth.currentUser, newPassword)
  }

  function subscribeHabits() {
    if (!user.value) return
    const q = query(collection(db, 'habits'), where('uid', '==', user.value.uid), orderBy('createdAt'))
    onSnapshot(q, snap => {
      habits.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
  }

  async function addHabit(habit) {
    if (!user.value) return
    await addDoc(collection(db, 'habits'), {
      ...habit, uid: user.value.uid, createdAt: serverTimestamp()
    })
  }

  async function updateHabit(id, data) {
    await updateDoc(doc(db, 'habits', id), data)
  }

  async function deleteHabit(id) {
    await deleteDoc(doc(db, 'habits', id))
  }

  function subscribeTasks() {
    if (!user.value) return
    const q = query(collection(db, 'tasks'), where('uid', '==', user.value.uid), orderBy('createdAt', 'desc'))
    onSnapshot(q, snap => {
      tasks.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
  }

  async function addTask(task) {
    if (!user.value) return
    await addDoc(collection(db, 'tasks'), {
      ...task, uid: user.value.uid, done: false, createdAt: serverTimestamp()
    })
  }

  async function updateTask(id, data) {
    await updateDoc(doc(db, 'tasks', id), data)
  }

  async function deleteTask(id) {
    await deleteDoc(doc(db, 'tasks', id))
  }

  function subscribeDayLogs() {
    if (!user.value) return
    const q = query(collection(db, 'dayLogs'), where('uid', '==', user.value.uid))
    onSnapshot(q, snap => {
      const logs = {}
      snap.docs.forEach(d => { logs[d.data().date] = d.data() })
      dayLogs.value = logs
    })
  }

  async function logDay(date, data) {
    if (!user.value) return
    const id = `${user.value.uid}_${date}`
    await setDoc(doc(db, 'dayLogs', id), { uid: user.value.uid, date, ...data }, { merge: true })
  }

  const todayStr = computed(() => new Date().toISOString().split('T')[0])
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

  const todayHabits = computed(() => {
    const dow = dayNames[new Date().getDay()]
    return habits.value.filter(h => h.days && h.days.includes(dow))
  })

  const todayTasks = computed(() => {
    const today = todayStr.value
    return tasks.value.filter(t => !t.done && t.deadline && t.deadline.startsWith(today))
  })

  const overdueTasks = computed(() => {
    const today = todayStr.value
    return tasks.value.filter(t => !t.done && t.deadline && t.deadline < today)
  })

  const priorityQueue = computed(() => {
    const log = dayLogs.value[todayStr.value] || {}
    const completedIds = new Set(log.completed || [])

    const items = []
    ;[...overdueTasks.value, ...todayTasks.value]
      .filter(t => t.important)
      .forEach(t => items.push({ ...t, _type: 'task', _priority: 1, _done: completedIds.has(t.id) }))
    todayHabits.value
      .filter(h => h.important)
      .forEach(h => items.push({ ...h, _type: 'habit', _priority: 2, _done: completedIds.has(h.id) }))
    todayHabits.value
      .filter(h => !h.important)
      .forEach(h => items.push({ ...h, _type: 'habit', _priority: 3, _done: completedIds.has(h.id) }))
    ;[...overdueTasks.value, ...todayTasks.value]
      .filter(t => !t.important)
      .forEach(t => items.push({ ...t, _type: 'task', _priority: 4, _done: completedIds.has(t.id) }))

    return items
  })

  const currentItem = computed(() => priorityQueue.value.find(i => !i._done) || null)

  async function completeItem(item) {
    const log = dayLogs.value[todayStr.value] || {}
    const completed = [...(log.completed || []), item.id]
    await logDay(todayStr.value, { completed })
    if (item._type === 'task') {
      await updateTask(item.id, { done: true })
    }
    await recalcDayScore(todayStr.value)
  }

  async function recalcDayScore(date) {
    const log = dayLogs.value[date] || {}
    const completed = new Set(log.completed || [])
    const dow = dayNames[new Date(date + 'T12:00:00').getDay()]
    const dayHabits = habits.value.filter(h => h.days && h.days.includes(dow))

    let allImportantDone = true
    let allNormalDone = true
    let anyDone = completed.size > 0

    dayHabits.forEach(h => {
      if (h.important && !completed.has(h.id)) allImportantDone = false
      if (!h.important && !completed.has(h.id)) allNormalDone = false
    })

    let score = 'none'
    if (anyDone) {
      if (allImportantDone && allNormalDone) score = 'star'
      else if (allImportantDone || allNormalDone) score = 'mid'
      else score = 'fail'
    }
    await logDay(date, { score })
  }

  return {
    user, userProfile, habits, tasks, dayLogs, loading,
    initAuth, login, register, logout,
    updateUserProfile, changePassword, loadUserProfile,
    addHabit, updateHabit, deleteHabit,
    addTask, updateTask, deleteTask,
    logDay, todayStr, todayHabits, todayTasks, overdueTasks,
    priorityQueue, currentItem, completeItem
  }
})
