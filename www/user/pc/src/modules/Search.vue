<template lang="jade">
  .search
    input.search-box( type="text" )
    input.search-btn( type="button" value="搜索" )
</template>

<script></script>

<style lang="stylus" scoped>
  .search
    background: #ffffff
    display: flex
    justify-content flex-end
    align-items center
    height: 80px
    .search-box
      width: 280px
      height: 32px
      padding: 0 10px
      border 2px solid #0E113A
    .search-btn
      background: #0E113A url( "~images/search.png" ) no-repeat 20px center
      width: 100px
      height: 36px
      border 0
      cursor pointer
      font-size: 16px
      font-weight: normal
      text-align: center
      padding-left: 20px
      color: #fff
</style>
