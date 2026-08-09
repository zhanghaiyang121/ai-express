<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <p class="error-desc">抱歉，您访问的页面不存在</p>
      <el-button type="primary" @click="$router.push('/')">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: $color-bg;
}

.error-content {
  text-align: center;

  .error-code {
    font-size: 72px;
    font-weight: 700;
    color: $color-info;
    margin-bottom: 16px;
  }

  .error-desc {
    font-size: $font-size-large;
    color: $color-text-secondary;
    margin-bottom: 24px;
  }
}
</style>