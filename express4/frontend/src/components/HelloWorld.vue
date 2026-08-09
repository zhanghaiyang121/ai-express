<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  msg?: string
}>()

const count = ref(0)
</script>

<template>
  <div class="hello-world">
    <h1>{{ msg || 'Hello World' }}</h1>
    <div class="card">
      <button type="button" @click="count++">
        Count is {{ count }}
      </button>
    </div>
    <p class="tip">
      Edit <code>src/components/HelloWorld.vue</code> to test HMR
    </p>
  </div>
</template>

<style scoped lang="scss">
.hello-world {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 24px;
    color: $primary-color;
  }

  .card {
    margin-bottom: 20px;

    button {
      padding: 10px 24px;
      font-size: 16px;
      background-color: $primary-color;
      color: #fff;
      border-radius: 8px;
      transition: background-color 0.3s;

      &:hover {
        background-color: color-mix(in srgb, $primary-color, #000 10%);
      }
    }
  }

  .tip {
    color: $text-secondary;
    font-size: 13px;

    code {
      background-color: #eee;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }
}
</style>