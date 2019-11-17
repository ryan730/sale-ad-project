<template lang="jade">
  .new-addr
    span.close( @click="close" )
    .info
      .title 新增收货人地址
      dl
        dt 姓名
        dd
          input.name( type="text" placeholder="填写收件人姓名" v-model="contacts" )
        dt 手机号码
        dd
          input.iphone( type="number" placeholder="填写收件人手机号" v-model="mobile" )
        dt 所在地域
        dd
          select.range
            option 北京
        dt 详细地址
        dd
          input.addr( type="text" placeholder="请输入收件人详细地址" v-model="receivingAddr" )
    span.save( @click="addAddrs" ) 保存收货人信息
</template>

<script>
import { addReceivingAddr } from '@/core/api';
import codes from '@/config/codes';

export default {
  name: 'newAddr',
  data() {
    return {
      contacts: '',
      mobile: '',
      receivingAddr: '',
      defaultFlag: 0,
      status: 1,
      userID: this.getUserID(),
      optUserID: this.getUserID()
    };
  },
  methods: {
    addAddrs() {
      addReceivingAddr( {
        data: {...this.$data},
      } ).then( data => {
        this.$message( {
          message: '新增地址成功！',
          type: 'success'
        } );
        this.$emit( 'getNewAddr', data );
        this.$emit( 'close' );
      } );
    },

    close() {
      this.$emit( 'close' );
    }
  }
};
</script>

<style lang="stylus" scoped>
  .new-addr
    position absolute
    background: #ffffff
    top 50%
    left 50%
    margin-left -240px
    margin-top -283px
    width: 480px
    border 4px solid #F0F3F5
    padding-top: 20px
    padding-left: 48px
    padding-bottom: 55px
    overflow: hidden
    .close
      float right
      background: url('~assets/public/images/close.png') no-repeat
      width: 16px
      height: 16px
      margin-right: 20px
      cursor pointer
    .info
      clear both
      .title
        font-size: 16px
        color: #333333
      dl
        margin-top: 20px
        dt
          margin-bottom: 10px
          font-size: 14px
          color: #666666
        dd
          margin-bottom: 20px
          &:last-child
            margin-bottom: 0
          input
          select
            background: #ffffff
            border 1px solid #C5C6D6
            padding-left: 5px
            width: 370px
            height: 40px
            font-size: 14px
            color: #999999
    .save
      display block
      background: #2d316c
      width: 250px
      height: 50px
      line-height: 50px
      margin-left: 88px
      margin-top: 30px
      text-align: center
      font-size: 16px
      color: #ffffff
      cursor pointer
</style>
