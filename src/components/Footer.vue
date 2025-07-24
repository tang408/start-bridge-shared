<template>
  <div class="footer">
    <div class="container">
      <div class="col-sm-3 col-12">
        <img src="@/assets/images/logo-white.png" class="footer-logo" />
      </div>
      <div class="col-sm-3 col-12 community desktop-flex-none">
        <img src="@/assets/images/line.png" />
        <img src="@/assets/images/ig.png" />
        <img src="@/assets/images/fb.png" />
      </div>
      <div class="col-sm-3 col-12">
        <div class="information">
          <span>台北市中山區松江路111號10樓之3</span>
          <span>starbridge.com.tw@gmail.com</span>
          <span>02-66043139</span>
        </div>
      </div>
      <div class="col-sm-3 col-12 statement">
        <span>平台合約聲明</span><span>版權內容</span>
      </div>
      <div class="col-sm-3 col-12 community mobile-none">
        <img src="@/assets/images/line.png" />
        <img src="@/assets/images/ig.png" />
        <img src="@/assets/images/fb.png" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Footer",
};
</script>

<style lang="scss" scoped>
.footer {
  background: linear-gradient(180deg, #ff9966 0%, #ff6634 100%);
  color: #fff;
  height: 230px;
  align-content: center;
  @media (max-width: 767px) {
    height: 596px;
  }
  &-logo {
    width: 97px;
    @media (max-width: 767px) {
      width: 145px;
    }
  }

  .container {
    display: flex;
    @media (max-width: 767px) {
      flex-flow: column;
      text-align: center;
      gap: 30px;
    }
    .col-sm-3 {
      justify-content: center;
      display: grid;
      .information {
        display: inline-flex;
        flex-flow: column;
        @media (max-width: 767px) {
          display: flex;
          flex-flow: column;
          gap: 5px;
        }
      }
      &.statement {
        display: flex;
        gap: 10px;
        @media (max-width: 767px) {
          flex-flow: column;
          gap: 0;
        }
      }
      &.community {
        gap: 10px;
        justify-content: end;
        @media (max-width: 767px) {
          display: flex;
          justify-content: center;
        }
        img {
          width: 30px;
          height: 30px;
        }
      }
    }
  }
}
</style>
