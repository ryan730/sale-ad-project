<template lang="jade">
  #modify-pw
    ul
      li
        span 旧密码
        input( type="password" )
        .forget
          a( href="#" ) 忘记密码?
      li
        span 新密码
        input( type="password" )
      li
        span 确认新密码
        input( type="password" )
    a.save( href="#" ) 保存
</template>

<script></script>

<style lang="stylus" scoped>
  #modify-pw
    margin-top: 44px
    ul
      overflow: hidden
      li
        margin-bottom: 10px
        span
          display: inline-block
          width: 115px
          margin-right: 20px
          text-align: right
        .forget
          padding-top 9px
          padding-left 135px
          padding-bottom 20px
          font-size 14px
          color #444B9C
        input
          width 400px
          height 40px
          border 1px solid #C5C6D6
          padding-left 15px
          font-size 14px
          color #999
    .save
      display block
      background #2D316C
      width 131px
      height 40px
      margin-top 30px
      margin-left 135px
      line-height 40px
      text-align center
      color #fff
      font-size 14px
</style>