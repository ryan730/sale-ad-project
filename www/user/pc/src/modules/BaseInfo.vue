<template lang="jade">
  #base-info
    h3 基本信息
    .info
      ul
        li
          span 用户名
          span.name 123132131
        li
          span 昵 称
          input.nick-name( type="text" placeholder="设置您的昵称" )
        li
          span 性 别
          span
            input( type="radio" id="secret" )
            label( for="secret" ) 保密
          span
            input( type="radio" id="male" )
            label( for="male" ) 男
          span
            input( type="radio" id="female" )
            label( for="female" ) 女
    h3 头像设置
    .image
      aside.up-image
        img( :src="src" )
        .file
          span.txt 上传头像
          input( type="file" )
          span 仅支持PNG, JPG, GIF, 且文件小于2M
      aside.patten-image
        span 您上传的图像将会自动生成3个尺寸，请注意大中小尺寸是否清晰
        img.big( :src="srcB" )
        em 大尺寸 140 * 140
        img.medium( :src="srcM" )
        em 中尺寸 60 * 60
        img.samll( :src="srcS" )
        em 小尺寸 32 * 32
    a.save( href="#" ) 保存
</template>

<script>
  export default {
    name: 'baseInfo',
    data() {
      return {
        src: 'images/photo.def.png',
        srcB: 'images/photo.def.png',
        srcM: 'images/photo.def.png',
        srcS: 'images/photo.def.png'
      };
    }
  };
</script>

<style lang="stylus" scoped>
  #base-info
    margin-top: 20px
    h3
      margin-bottom: 20px
      font-weight: normal
      font-size: 16px
      color: #333
    .info
      margin-bottom: 30px
      padding-left: 20px
      ul
        overflow: hidden
        li
          margin-top: 18px
          word-spacing: 10px
          font-size: 14px
          color: #333
          span
            display: inline-block
            margin-right: 20px
            text-align: right
            color: #666
          .name
          label
            color: #333
          .nick-name
            width: 400px
            height: 40px
            line-height: 40px
            padding-left: 15px
            border: 1px solid #C5C6D6
            font-size: 14px
            color: #999
          label
            margin-left: 12px
    .image
      display: flex
      margin-top: 20px
      padding-left: 20px
      .up-image
        position: relative
        img
          width: 375px
        .file
          display: flex
          flex-direction: column
          align-items: center
          position: absolute
          top: 50%
          left: 50%
          width: 217px
          margin-left: -108px
          text-align: center
          input[type="file"]
            position: absolute
            width: 122px
            height: 33px
            opacity: 0
          span
            display: block
            color: #666666
            font-size: 12px
          .txt
            background: #fff
            width: 120px
            height: 32px
            line-height: 32px
            margin-bottom: 12px
            text-align: center
            font-size: 14px
            color: #444B9C
    .patten-image
      margin-left: 30px
      span
        display: block
        white-space: nowrap
        color: #666
        font-size: 12px
        margin-bottom: 21px
      img
      em
        display: block
      img
        margin-bottom: 10px
      em
        margin-bottom: 10px
        color: #666
        font-size: 12px
      .big
        width: 140px
        height: 140px
      .medium
        width: 60px
        height: 60px
      .samll
        width: 32px
        height: 32px
    .save
      display: block
      background: #2D316C
      width: 130px
      height: 40px
      line-height: 40px
      margin-top: 30px
      text-align: center
      font-size: 14px
      color: #fff
</style>