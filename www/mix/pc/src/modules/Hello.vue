
<template lang="jade">
  .hello {{ msg }}
</template>

<script>
  export default {
    name: 'hello',
    data() {
      return {
        msg: 'Welcome to Your Vue.js Appx'
      };
    }
  };
</script>

<style lang="stylus" scoped></style>