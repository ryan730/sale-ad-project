
<template lang="jade">
  #app
    router-view( :class="{'move-out': moveOut}" )
    Mine( :class="{'move-out-mine': moveOut}" )
</template>

<script>
import { mapState } from 'vuex';
import store from 'vx/index';
import Mine from '@/modules/Mine.vue';

export default {
  name: 'app',
  store,
  components: {
    Mine
  },
  computed: {
    ...mapState( {
      moveOut: state => state.moveOut
    } )
  },
  mounted() {
    this.load();
  },
  updated() {
    this.load();
  },
  methods: {
    load() {
      let $content = document.getElementsByClassName( 'content' )[0];
      let $header = document.getElementsByClassName( 'header' )[0] || document.getElementsByClassName( 'other' )[0];
      let $footer = document.getElementsByClassName( 'footer' )[0];
      let fixHeight, footerHeight;

      try {
        if ( $header ) {
          footerHeight = $footer ? $footer.offsetHeight : 0;
          fixHeight = window.innerHeight - $header.offsetHeight - footerHeight;
          $content.style.height = fixHeight + 'px';
          $content.style.overflow = 'auto';
          $content.style.flex = 1;
        }
      } catch ( evt ) {
        console.error( '页面中需要有一个 class 名为 .content 的元素!' );
      }
    }
  }
};
</script>

<style lang="stylus">
  @import '~assets/css/funs/px2rem.styl';

  html,
  body
    height: 100%
    overflow: hidden;
  .move-out
    margin-left: $px2rem( -302px )
    transition: margin 1s ease-out;
</style>
