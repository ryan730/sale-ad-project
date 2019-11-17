<template lang="jade">
  #emp
    TopHeader
    router-view
    BottomFooter
</template>

<script>
import store from 'vx/index';
import TopHeader from 'modules/Header.vue';
import BottomFooter from 'modules/Footer.vue';

export default {
  name: 'emp',
  store,
  components: {
    TopHeader,
    BottomFooter
  }
};
</script>

<style lang="stylus">
  #index
    position: relative
    min-width 1400px
</style>
