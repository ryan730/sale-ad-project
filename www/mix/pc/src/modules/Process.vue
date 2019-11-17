<template lang="jade">
  .process( :class="step_num()" )
    span.process-step( v-for="(item, index) in steps" )
      .step-wrap( :name="index" )
        span {{index+1}}
        em.step {{item}}
</template>

<script>
  export default {
    name: 'process',
    props: ['step', 'steps'],
    computed: {
      step_num() {
        return () => {
          let step;

          switch ( this.step ) {
            case 1:
              step = 'step_1';
              break;
            case 2:
              step = 'step_2';
              break;
            case 3:
              step = 'step_3';
              break;
            case 4:
              step = 'step_4';
              break;
          }
          return step;
        };
      }
    }
  };
</script>

<style lang="stylus" scoped>
  bg()
    background: #BDE492
    span
      background: #BDE492
      color: #ffffff

  .process
    display flex
    justify-content: flex-end
    align-items center
    height: 156px
    text-align: center
    font-size: 14px
    color: #666666
    .step
      display block
      padding-top: 25px
      text-align: center
      font-style normal
    div
      position: relative
      background: #f0f3f5
      width: 138px
      height: 4px
      margin-right: 5px
      span
        background: #f0f3f5
        display flex
        align-items center
        justify-content center
        position: absolute
        left: 50%
        top: 50%
        margin-top: -12px
        margin-left: -12px
        width: 24px
        height: 24px
        border-radius 24px
        text-align: center
        font-size: 14px
        color: #666666
  .step_1
    [name="0"]
      bg()

  .step_2
    [name="0"]
    [name="1"]
      bg()

  .step_3
    [name="0"]
    [name="1"]
    [name="2"]
      bg()

  .step_4
    [name="0"]
    [name="1"]
    [name="2"]
    [name="3"]
      bg()
</style>
