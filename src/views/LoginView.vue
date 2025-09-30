<template>
  <div class="login-page">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>
    <div class="login-panel">
      <div class="panel-header">
        <div class="panel-logo">
          <span class="logo-icon">灯</span>
        </div>
        <h1 class="panel-title">资产灯塔系统</h1>
      </div>
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
        class="login-form"
        @submit.prevent="handleSubmit"
      >
        <a-form-item name="username">
          <template #label>
            <label class="form-label"><span class="required">*</span> 用户名：</label>
          </template>
          <a-input v-model:value="formState.username" placeholder="请输入用户名" allow-clear size="large" />
        </a-form-item>
        <a-form-item name="password">
          <template #label>
            <label class="form-label"><span class="required">*</span> 密码：</label>
          </template>
          <a-input-password v-model:value="formState.password" placeholder="请输入密码" size="large" />
        </a-form-item>
        <a-form-item class="submit-item">
          <a-button class="submit-btn" type="primary" block :loading="loading" html-type="submit" size="large">
            登 录
          </a-button>
        </a-form-item>
      </a-form>
      <div class="panel-footer">
        <p class="footer-line">Powered by TCCT(Tophant Competence Center) ARL 2.3.1</p>
        <p class="footer-line">本系统为开源项目 <a href="https://github.com/Aabyss-Team/ARL" target="_blank" rel="noopener">Github</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { login } from '@/api/auth';
import { setToken, setUsername, clearAuth } from '@/utils/auth';

const router = useRouter();
const route = useRoute();

const formRef = ref();
const loading = ref(false);
const bgCanvas = ref();
let ctx = null;
let particles = [];
let animationId = null;

const formState = reactive({
  username: '',
  password: ''
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
};

const handleSubmit = () => {
  if (!formRef.value || typeof formRef.value.validate !== 'function') {
    return;
  }

  formRef.value
    .validate()
    .then(async () => {
      loading.value = true;
      try {
        const { data } = await login({
          username: formState.username,
          password: formState.password
        });
        if (data?.code === 200 && data?.data?.token) {
          setToken(data.data.token);
          setUsername(data.data.username || formState.username);
          message.success('登录成功');
          const redirect = route.query.redirect || '/';
          router.replace(redirect);
        } else {
          clearAuth();
          message.error(data?.message || '登录失败');
        }
      } catch (error) {
        clearAuth();
        const msg = error?.response?.data?.message || '登录失败，请重试';
        message.error(msg);
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {
      message.warning('请完善登录信息');
    });
};

const PARTICLE_COLOR = '#ff2d91';
const PARTICLE_COUNT_BASE = 120;
const MAX_DISTANCE = 140;

const createParticles = (width, height) => {
  const count = Math.min(PARTICLE_COUNT_BASE, Math.floor((width * height) / 9000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    radius: Math.random() * 1.6 + 0.6
  }));
};

const drawParticles = (width, height) => {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = PARTICLE_COLOR;
  particles.forEach((particle) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = 'rgba(255, 45, 145, 0.25)';
  particles.forEach((a, i) => {
    for (let j = i + 1; j < particles.length; j += 1) {
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < MAX_DISTANCE) {
        ctx.lineWidth = 1 - dist / MAX_DISTANCE;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  });
};

const updateParticles = (width, height) => {
  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x <= 0 || particle.x >= width) {
      particle.vx *= -1;
    }
    if (particle.y <= 0 || particle.y >= height) {
      particle.vy *= -1;
    }
  });
};

const animate = () => {
  if (!ctx) return;
  const { width, height } = ctx.canvas;
  updateParticles(width, height);
  drawParticles(width, height);
  animationId = requestAnimationFrame(animate);
};

const resizeCanvas = () => {
  if (!bgCanvas.value) return;
  const canvas = bgCanvas.value;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');
  createParticles(canvas.width, canvas.height);
};

onMounted(() => {
  resizeCanvas();
  animate();
  window.addEventListener('resize', resizeCanvas);
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('resize', resizeCanvas);
  ctx = null;
  particles = [];
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: radial-gradient(circle at top, rgba(36, 45, 62, 0.95), rgba(13, 17, 26, 0.98));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  position: relative;
  overflow: hidden;
}

.bg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.login-panel {
  position: relative;
  z-index: 1;
  width: 420px;
  max-width: 100%;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 12px;
  padding: 36px 54px 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  text-align: center;
}

.panel-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.panel-logo {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(180deg, #1ed6f3, #0fb7d8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  box-shadow: 0 6px 18px rgba(16, 200, 230, 0.4);
}

.panel-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: #404040;
}

.login-form {
  text-align: left;
}

.form-label {
  font-size: 14px;
  color: #666;
}

.required {
  color: #ff4d4f;
  margin-right: 4px;
}

.submit-item {
  margin-top: 16px;
}

.submit-btn {
  height: 46px;
  background: #0fcae5;
  border: none;
  font-size: 16px;
  font-weight: 600;
}

.submit-btn:not(.ant-btn-loading):hover {
  background: #0eb6cf;
}

.panel-footer {
  margin-top: 28px;
  color: #999;
  font-size: 12px;
}

.panel-footer a {
  color: #0fcae5;
}

.footer-line {
  margin: 4px 0 0;
}
</style>
