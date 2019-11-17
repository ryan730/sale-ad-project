<template lang="jade">
  .details
    .top
      Logo
    .bread-crumbs(v-html='crumb()')
    .detail
      .product-info
        img( :src="getPic" )
        .introdution
          .name {{infoData.commodityName}}
          .info
            span
              | 官方指导价：
              em ￥{{infoData.price}}
            span 商品编号：{{infoData.commodityCode}}
            span 商品品牌：{{getProductType()}}
          .count
            span 购买数量
            span.counter
              a.reduce( @click='numHandler(-1)' ) -
              input( type="text",:value="num" )
              a.add( @click='numHandler(1)' ) +
          span.buy( @click='addCommodityToCart' ) 加入购物车
    Detail(:infoData='infoData',@click='addCommodityToCart')
</template>

<script>
import Logo from 'modules/Logo.vue';
import Detail from 'modules/Details.vue';
import ajax from '@/units/core/AJAX';
import CODES from '@/units/CONFIG/codes';
import URLS from '@/units/CONFIG/urls';
import Cart from '@/units/core/Cart';

export default {
  name: 'detail',
  data() {
    return {
      infoData: {},
      num: 1,
      color: 'white',
      crumb: () => {
        let ca = JSON.parse( JSON.stringify( this.$route.meta ) );
        let cr = '';
        if ( ca && ca instanceof Array ) {
          ca.push( this.getProductType() );
          ( this.infoData.commodityName ) && ca.push( this.infoData.commodityName );
          cr = ca.join( '&nbsp>&nbsp' );
        }
        // 首页 > 购买红酒 > 香格里拉 > {{infoData.commodityName}}
        return cr.length > 0 ? '当前位置：' + cr : '';
      }
    };
  },
  components: {
    Detail,
    Logo
  },
  computed: {
    getPic() {
      return this.infoData.pic ? URLS.BaseURL + this.infoData.pic : '';
    }
  },
  mounted() {
    this.getPageInfor();
    Cart.getCartList( {
      $store: this.$store
    } );
  },
  methods: {
    /* 获取detail页面内容 */
    getPageInfor() {
      ajax.get( {
        url: URLS.getCommodityChannelByID,
        data: {
          params: {
            commodityID: 'e9ae793335844215a602b4c6c0542567'
          }
        },
        success: res => {
          if ( !res.data ) {
            console.warn( '返回异常:', res.config.url );
            return;
          }
          if ( String( res.data.code ) === '0' ) {
            this.infoData = res.data.result;
          } else {
            console.warn( res.data.msg );
          }
        }
      } );
    },
    getProductType() {
      let type = this.$route.params.id;
      let name = '香格里拉';
      switch ( type ) {
        case '1010':
          name = '口子窖';
          break;
        case '1020':
          name = '香格里拉';
          break;
        case '1030':
          name = '土特产';
          break;
      }
      return name;
    },
    numHandler( val ) {
      if ( val > 0 ) {
        this.num++;
      } else if ( val < 0 ) {
        this.num--;
      }
      this.num = Math.max( 0, this.num );
    },
    /* detail页添加到购物车 */
    addCommodityToCart() {
      ajax.post( {
        url: URLS.addCommodityToCart,
        data: {
          userID: '703d065b0b684ae9bf4fa3be67a4726c',
          commodityID: 'e9ae793335844215a602b4c6c0542567',
          num: this.num
        },
        success: res => {
          if ( !res.data ) {
            console.warn( '返回异常:', res.config.url );
            return;
          }

          if ( res.data.code === CODES.SUCCESS ) {
            alert( res.data.msg );
          } else {
            console.warn( res.data.msg );
          }
        }
      } );
    }
  }
};
</script>

<style lang="stylus" scoped>
  .details
    .top
      display: flex
      align-items: center
      justify-content: space-between
      border-bottom 1px solid #F0F3F5
      margin-right: 240px
      margin-left: 310px
    .bread-crumbs
      float: right
      margin-right: 310px
      margin-top: 30px
      margin-bottom: 20px
      font-size: 12px
      color: #999999
    .detail
      clear: both
      border-top 1px solid #F0F3F5
      margin: 0 310px
      padding-top: 44px
      .product-info
        display flex
        width: 100%
        padding-bottom 124px
        margin-bottom 20px
        border-bottom 1px solid #F0F3F5
        img
          width 500px
          margin-right: 103px
        .introdution
          width: 100%
          align-self flex-end
          .name
            margin-top: 68px
            font-size: 26px
            color: #666666
          .info
            display flex
            justify-content center
            flex-direction column
            background: #f0f3f5
            padding: 16px 0 16px 16px
            margin-top: 51px
            font-size: 14px
            color: #333333
            &:last-child
              margin-bottom: 0
            span
              margin-bottom: 8px
            em
              font-size: 20px
          .count
            margin-top: 26px
            span
              display block
              font-size: 14px
              color: #333333
            .counter
              display flex
              align-items center
              margin-top: 10px
              input
                width: 100px
                height: 40px
                border 1px solid #C5C6D6
                padding-left: 10px
                font-size: 18px
                color: #2d316c
              .reduce
              .add
                display inline-block
                width: 40px
                height: 40px
                line-height: 36px
                border 1px solid #C5C6D6
                text-align: center
                font-size: 30px
                color: #2d316c
              .reduce
                margin-right: 10px
              .add
                margin-left: 10px
          .buy
            display block
            background: #2d316c
            width: 217px
            height: 48px
            line-height: 48px
            margin-top: 50px
            font-size: 16px
            color: #ffffff
            text-align: center
            &:before
              content '+'
              margin-right: 10px
          .reduce
          .add
          .buy
            cursor: pointer
</style>
