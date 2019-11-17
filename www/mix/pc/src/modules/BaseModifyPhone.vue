<template lang="jade">
  #modify-phone
    ul
      li
        span 原手机号
        i 123243423
      li
        span 新手机号
        input.phone( type="number" )
      li
        span 验证码
        input.code( type="text" placeholder="请输入验证码" )
        a.getCode( href="#" ) 获取验证码
    <!-- a.next( href="#" ) 下一步 -->
    a.ok( href="#" ) 完成
</template>

<script></script>

<style lang="stylus" scoped>
  #modify-phone
    padding-top 40px
    ul
      overflow hidden
      li
        margin-bottom 19px
        span
          display inline-block
          width 86px
          margin-right 20px
          color #666
          font-size 14px
          text-align right
        em
          font-size 14px
          color #333
        input
          width 280px
          height 40px
          padding-left 16px
          border: 1px solid #C5C6D6
          font-size 14px
          color #999
        .code
          border-right none
        .phone
          width 400px
        .getCode
          display inline-block
          background #E8E9F1
          width 120px
          height 40px
          line-height 40px
          border 1px solid #C5C6D6
          font-size 14px
          color #444B9C
          text-align center
    .next
    .ok
      display block
      background #2D316C
      width 130px
      height 40px
      line-height 40px
      margin-left 106px
      text-align center
      font-size 14px
      color #fff
</style>