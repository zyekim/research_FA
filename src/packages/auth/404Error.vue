<script lang="ts" setup></script>
<template>
  <v-container
    class="fill-height errPage"
    style="background-color: #f5f5f5"
  >
    <v-responsive
      class="align-centerfill-height mx-auto pa-1 flex-shrink-1"
      max-width="900"
      min-width="300"
    >
      <div class="errPage__container">
        <div class="text-center">
          <v-icon size="122px">custom:404Icon</v-icon>
        </div>
        <div class="text-center mt-36">
          <div class="text-rt-h2">페이지를 찾을 수 없습니다.</div>
          <p class="text-body-1 text-body-light mt-8">
            입력하신 주소가 정확한지 다시 한번 확인해 주세요
          </p>
          <p class="text-body-1 text-body-light mt-2">
            새로고침을 하시거나, 쿠키 및 캐시를 지우고 다시 한번 시도해 주세요.
          </p>

          <v-btn
            variant="outlined"
            class="mt-20"
            to="/dashboard"
          >
            <template #prepend>
              <v-icon size="18px">mdi-home-outline</v-icon>
            </template>
            대시보드 화면으로</v-btn
          >
        </div>
      </div>
    </v-responsive>
  </v-container>
</template>
<style lang="scss">
.v-application:has(.errPage) {
  background: #f5f5f5 !important;
}
</style>
