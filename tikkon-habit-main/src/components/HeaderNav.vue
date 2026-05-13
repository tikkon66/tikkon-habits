<template>
  <nav class="navbar">
    <div class="nav-inner">
      <router-link to="/focus" class="nav-logo">
        <span class="logo-hex">⬡</span>
        <span class="logo-text">tikkon<span class="logo-dot">.habit</span></span>
      </router-link>

      <div class="nav-links">
        <router-link to="/focus" class="nav-link" :class="{ active: $route.path === '/focus' }">
          <span class="nav-icon">◉</span>Фокус
        </router-link>
        <router-link to="/lists" class="nav-link" :class="{ active: $route.path === '/lists' }">
          <span class="nav-icon">☰</span>Списки
        </router-link>
        <router-link to="/year" class="nav-link" :class="{ active: $route.path === '/year' }">
          <span class="nav-icon">◫</span>Год
        </router-link>
        <router-link to="/profile" class="nav-link" :class="{ active: $route.path === '/profile' }">
          <div class="nav-avatar" :style="avatarStyle">
            {{ avatarLetter }}
          </div>
        </router-link>
      </div>

      <div class="nav-mobile">
        <router-link to="/focus" class="mob-link" :class="{ active: $route.path === '/focus' }">
          <span>◉</span><small>Фокус</small>
        </router-link>
        <router-link to="/lists" class="mob-link" :class="{ active: $route.path === '/lists' }">
          <span>☰</span><small>Списки</small>
        </router-link>
        <router-link to="/year" class="mob-link" :class="{ active: $route.path === '/year' }">
          <span>◫</span><small>Год</small>
        </router-link>
        <router-link to="/profile" class="mob-link" :class="{ active: $route.path === '/profile' }">
          <div class="nav-avatar" :style="avatarStyle">
            {{ avatarLetter }}
          </div>
          <small>Профиль</small>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const avatarLetter = computed(() => {
  const name = store.userProfile?.name || store.user?.displayName || store.user?.email || '?'
  return name[0].toUpperCase()
})
const avatarStyle = computed(() => {
  return store.userProfile?.avatar
    ? { backgroundImage: `url(${store.userProfile.avatar})`, backgroundSize: 'cover' }
    : {}
});
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  height: var(--nav-h);
  background: rgba(37, 37, 57, 0.091);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}

.nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text);
}

.logo-hex {
  font-size: 1.4rem;
  color: var(--gold);
  filter: drop-shadow(0 0 6px rgba(245, 200, 66, 0.5));
}

.logo-text {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: -0.02em;
}

.logo-dot {
  color: var(--gold);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  color: var(--text2);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transition);
}

.nav-link:hover {
  color: var(--text);
  background: var(--surface);
}

.nav-link.active {
  color: var(--gold);
  background: rgba(245, 200, 66, 0.08);
}

.nav-icon {
  font-size: 0.85rem;
}

.nav-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--gold);
  color: #0a0a0f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
  font-family: var(--font-display);
}

.nav-mobile {
  display: none;
}

@media (max-width: 640px) {
  .nav-links {
    display: none;
  }

  .nav-mobile {
    display: none;
  }

  .nav-avatar {
    width: 25px;
    height: 25px;
    font-weight: 800;
    font-size: 0.70rem;
  }

  .navbar {
    top: auto;
    bottom: 0;
    top: unset;
    border-top: 1px solid var(--border);
    border-bottom: none;
  }

  .nav-inner {
    justify-content: center;
  }

  .nav-logo {
    display: none;
  }

  .nav-mobile {
    display: flex;
    gap: 0;
    width: 100%;
  }

  .mob-link {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 10px;
    color: var(--text3);
    text-decoration: none;
    font-size: 1.2rem;
    transition: color var(--transition);
  }

  .mob-link small {
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .mob-link.active {
    color: var(--gold);
  }
}
</style>
