<template lang="pug">
  #index
    PubHeader
    router-view
    PubFooter
</template>

<script>
  import PubHeader from '@/components/Header';
  import PubFooter from '@/components/Footer';

  export default {
    name: 'index',
    components: {
      PubHeader,
      PubFooter
    }
  }
</script>

<style>

</style>
