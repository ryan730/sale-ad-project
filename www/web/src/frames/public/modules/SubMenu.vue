<template lang="jade">
  menu.menu( :class="bg" )
    ul
      li( :class="{curr: kzj}" )
        a( href="#" type="1010" @click.prevent="updateList( $event )" ) 口子窖
        span
      li( :class="{curr: xgla}" )
        a( href="#" type="1020" @click.prevent="updateList( $event )" ) 香格里拉
        span
      li( :class="{curr: ttc}" )
        a( href="#" type="1030" @click.prevent="updateList( $event )" ) 土特产
        span
</template>

<script>
  import Bus from '@/core/EventBus';

  export default {
    name: 'subMenu',
    props: ['color'],
    data() {
      return {
        kzj: true,
        xgla: false,
        ttc: false
      };
    },
    created(){
      this.changeCurrent({type:this.$route.params.id});
    },
    computed: {
      bg() {
        return this.color;
      }
    },
    methods: {
      // todo: 更新列表内容
      updateList( evt ) {
        let type = evt.target.getAttribute( 'type' );

        // todo: 完成兄弟组件之间的通信
        Bus.$emit( 'updataList', {
          type
        } );

        // todo: 修改当前选中状态
        this.changeCurrent( {
          type
        } );
      },

      // todo: 修改当前选中状态
      changeCurrent( params ) {
        switch ( params.type ) {
          case '1010':
            this.kzj = true;
            this.xgla = this.ttc = !this.kzj;
            break;
          case '1020':
            this.xgla = true;
            this.kzj = this.ttc = !this.xgla;
            break;
          case '1030':
            this.ttc = true;
            this.kzj = this.xgla = !this.ttc;
            break;
        }
        this.$router.replace('/list/'+params.type)
      }
    }
  };
</script>

<style lang="stylus" scoped>
  .dark
    background: #0E113A
    a
      color: #ffffff
      &:hover
        background: #2D316C
    .curr
      position: relative
      background: #2D316C
      span
        position: absolute
        background: #fff
        bottom: 0
        left: 50%
        margin-left: -25px
        width: 50px
        height: 2px
  .white
    background: #f0f3f5
    a
      color: #333333
      &:hover
        color: #2d316c
    .curr
      position: relative
      background: #f0f3f5
      span
        position: absolute
        background: #2D316C
        bottom: 0
        left: 50%
        margin-left: -25px
        width: 50px
        height: 2px
  .menu
    display flex
    align-items center
    justify-content center
    margin: 0
    height: 40px
    ul
      overflow: hidden
      li
        display flex
        float left
        justify-content center
        font-size: 16px
        a
          padding: 9px 18px
</style>
