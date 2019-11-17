<template lang="jade">
    router-link(to="/")
      .logo {{title}}
</template>

<script>
  export default {
    name: 'login',
    props: ['title']
  };
</script>

<style lang="stylus" scoped>
  .logo
    background-image: url( '~images/logo.png' )
    background-repeat: no-repeat
    background-size: contain
    padding-left: 215px
    margin: 19px 0
    height: 40px
    line-height: 40px
    font-size: 24px
    color: #0E113A
</style>
