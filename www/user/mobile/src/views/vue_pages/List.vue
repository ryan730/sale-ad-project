<template lang="jade">
  #list
    HeaderIndex( :header='header', :title='title' )
    .content
      img.banner( src="~images/banner.png" )
      .items
        router-link.cart( :to="{path: '/cart/cart'}" )
          span.num {{cartNum}}
        ul
          li( v-for="item in items" )
            img( :src="item.pic" )
            span.title {{item.commodityName}}
            span.money {{item.price}}
            span.add( @touchstart="addToCart", :id="item.commodityID" ) 加入购物车
</template>

<script>
import { mapState } from "vuex";
import HeaderIndex from "@/modules/header-index.vue";
import { MessageBox } from "mint-ui";
import Cart from "@/units/core/Cart.js";
import codes from "@/units/CONFIG/codes.js";
import urls from "@/units/CONFIG/urls.js";
import ajax from "@/units/core/AJAX.js";

export default {
  name: "index",
  props: ["id"],
  components: {
    HeaderIndex
  },
  computed: {
    ...mapState({
      cartNum: state => state.cartNum
    })
  },
  data() {
    return {
      header: "other",
      title: "",
      items: []
    };
  },
  mounted() {
    this.title = codes.product[this.id];

    ajax.get({
      url: urls.LIST,
      data: {
        params: {
          flag: 1,
          commodityTypeID: this.id
        }
      },
      success: res => {
        if (res.data.code === codes.SUCCESS) {
          res.data.result.forEach(item => {
            if (item.hasOwnProperty("pic")) {
              console.log('success1',urls.BaseURL + item.pic);
              item.pic = urls.BaseURL + item.pic;
            }
          });
          this.items = res.data.result;
          console.log('success2',this.items);
        }
      }
    });

    Cart.getCartList({
      $store: this.$store
    });
  },
  methods: {
    addToCart(evt) {
      let target = evt.target;

      ajax.post({
        url: urls.ADDTOCART,
        data: {
          userID: "703d065b0b684ae9bf4fa3be67a4726c",
          commodityID: target.id,
          num: 1
        },
        success: res => {
          this.$store.dispatch("changeCartNum", {
            num: this.$store.getters.getCartNum + 1
          });

          res.data.code !== codes.SUCCESS && MessageBox.alert(res.data.msg);
        }
      });
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~assets/css/funs/px2rem.styl';

#list {
  .content {
    overflow: auto;

    .banner {
      width: auto;
      height: $px2rem(260px);
    }

    .items {
      .cart {
        position: fixed;
        background: url('~images/shop.png') no-repeat;
        background-size: contain;
        width: $px2rem(96px);
        height: $px2rem(96px);
        right: 10px;
        bottom: 40px;

        .num {
          position: absolute;
          background: #FF2A44;
          right: 0;
          top: -3px;
          width: $px2rem(32px);
          height: $px2rem(32px);
          line-height: $px2rem(32px);
          border-radius: $px2rem(15px);
          font-size: $px2rem(24px);
          text-align: center;
          color: #fff;
        }
      }
    }

    ul {
      display: grid;
      grid-template-columns: 1fr 1fr;
      justify-content: center;
      padding-bottom: $px2rem(88px);

      li {
        text-align: center;
        background: #ffffff;
        border-right: 1px solid #F0F3F5;
        border-bottom: 1px solid #F0F3F5;
        padding-bottom: $px2rem(40px);

        span {
          display: block;
        }

        img {
          width: $px2rem(136px);
        }

        .title {
          font-size: $px2rem(28px);
        }

        .money {
          margin-top: $px2rem(10px);
          margin-bottom: $px2rem(20px);
          font-size: $px2rem(30px);

          &:before {
            content: '￥';
          }
        }

        .add {
          color: #2d316c;
          font-size: $px2rem(28px);

          &:before {
            content: '+';
            padding-right: 5px;
          }
        }
      }
    }
  }
}
</style>
