<template lang="jade">
  .personal-setting
    header.header
      h3 个人设置
      .change-info
        a.base-info(
          :class="{curr: isBaseInfo}",
          href="#", 
          type="baseInfo", 
          @click.prevent="change( $event )" 
          ) 个人基本信息
        a.addr( 
          :class="{curr: isBaseAddr}",
          href="#", 
          type="baseAddr", 
          @click.prevent="change( $event )" 
          ) 收货地址
        a.modify( 
          :class="{curr: isBaseModifyPW}",
          href="#", 
          type="baseModifyPW", 
          @click.prevent="change( $event )" 
          ) 修改密码
        a.phone( 
          :class="{curr: isBaseModifyPhone}",
          href="#", 
          type="baseModifyPhone", 
          @click.prevent="change( $event )" 
          ) 更换手机
    section
      BaseInfo( v-show="isBaseInfo" )
      BaseModifyPW( v-show="isBaseModifyPW" )
      BaseModifyPhone( v-show="isBaseModifyPhone" )
      BaseAddr( v-show="isBaseAddr" )
      Success( v-show="isSuccess", :type="type" )
</template>

<script>
  import BaseInfo from 'modules/BaseInfo.vue';
  import BaseModifyPW from 'modules/BaseModifyPW.vue';
  import BaseModifyPhone from 'modules/BaseModifyPhone.vue';
  import BaseAddr from 'modules/BaseAddr.vue';
  import Success from 'vpages/Success.vue';

  export default {
    name: 'personalSetting',
    components: {
      BaseInfo,
      BaseModifyPW,
      BaseModifyPhone,
      BaseAddr,
      Success
    },
    data() {
      return {
        type: 'phone',
        isBaseInfo: true,
        isBaseModifyPW: false,
        isBaseModifyPhone: false,
        isBaseAddr: false,
        isSuccess: false
      }
    },
    methods: {
      change( evt ) {
        let type = evt.target.getAttribute( 'type' );

        switch ( type ) {
          case 'baseInfo':
            this.isBaseInfo = true;
            this.isBaseModifyPW = this.isBaseAddr = this.isBaseModifyPhone = false;
            break;
          case 'baseAddr':
            this.isBaseAddr = true;
            this.isBaseModifyPW = this.isBaseInfo = this.isBaseModifyPhone = false;
            break;
          case 'baseModifyPW':
            this.isBaseModifyPW = true;
            this.isBaseAddr = this.isBaseInfo = this.isBaseModifyPhone = false;
            break;
          case 'baseModifyPhone':
            this.isBaseModifyPhone = true;
            this.isBaseAddr = this.isBaseInfo = this.isBaseModifyPW = false;
            break;
        }
      }
    }
  };
</script>

<style lang="stylus" scoped>
  .personal-setting
    .header
      display: flex
      justify-content: space-between;
      align-items: center
      border-bottom: 1px solid #F0F3F5
      padding-bottom: 14px
      margin-right 236px
      h3
        border-left: 4px solid #2D316C
        padding-left: 6px
        height: fit-content
        color: #333
        font-size: 16px
      .change-info
        a
          background: #F0F3F5
          display: inline-block
          width: 90px
          height: 28px
          line-height: 28px
          margin-right: 2px
          text-align: center
          font-size: 12px
          color: #333
        .curr
          background: #2D316C
          color: #fff
    section
      padding-right 236px
</style>