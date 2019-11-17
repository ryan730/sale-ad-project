<template lang="jade">
  .confirm-order
    .cover
      NewAddr
    .top
      Logo
      Process( :step="step", :steps="steps" )
    .order-addr
      .title
      span.icon
      span 选择收货方式
      span.add-addr( @click="showMoreAddrs" ) 使用其他收货地址
      .selectRadio
        input(type="radio", name="addrs", value="1", :checked="checkedAddrs" @click="homeAddrs")
        | 送货到家
        input(type="radio", name="addrs", value="0", :checked="!checkedAddrs" @click="pickUp")
        | 上门取货
      .addrs( :class="{'addr-more': addrMore}" )
        ul
          li(
          v-for="(item, index) in pickAdrs",
          :id="item.warehouseID"
          @click="changePickupaddr(index)"
          )
            span.name {{item.addr}}
            span.addr {{item.organizationName}} {{item.mobile}}
      .addrs( :class="{'addr-more': addrMore}" v-if="checkedAddrs")
        ul
          li(
          v-for="(item, index) in addrs",
          :id="item.receivingAddrID",
          @click="changeAddrDefault( index )"
          )
            span.name {{item.contacts}}
            span.addr {{item.receivingAddr}} {{item.mobile}}
    .confirm
      .title
        span.icon
        span 确认订单
      .list
        .title
          span 商品
          span 单价
          span 数量
          span 小计
        .items( v-for="item in items" )
          .content
            span.pic
              img( :src="item.commodity.pic" )
              span.name-discount
                span.name {{item.commodity.commodityName}}
            span.money
              span.line-through 指导价：
                i ￥{{item.commodity.price}}
              span 会员价：￥{{typeof item.commodity.commodityChannel === 'number' ? item.commodity.commodityChannel : 0}}
            span.num {{item.num}}
            span.count {{item.totalAmount}}
          .coupon( v-if="item.gifts.length > 0", v-for="gift in item.gifts" )
            span 多买多送，买六送一
            span [赠品] {{gift}}
    .coupon_more
      .title 订单赠品
      .items
        span
          img( src="" )
          span xxxx
        span *1
    .info
      span
        | 共有
        em {{count}}
        | 件商品
      span.count 总计: ￥{{memberCount}}
    .price
      span 优惠: ￥{{discount}}
      span 商品总价：￥{{amount}}
    span.pay( @click="pay" ) 去支付
</template>

<script>
import NewAddr from 'public/modules/NewAddr.vue';
import Logo from 'public/modules/Logo.vue';
import Process from 'public/modules/Process.vue';
import CODES from '@/config/codes';
import URLS from '@/config/urls';
import {
  getCustomerReceivingAddr,
  createOrder,
  getAllShop
} from '@/core/api';

export default {
  name: 'confirmOrder',
  components: {
    Logo,
    NewAddr,
    Process
  },
  data() {
    return {
      step: 2,
      steps: [
        '查看购物车',
        '确认订单信息',
        '在线付款',
        '收货'
      ],
      checkedAddrs: true,
      addrs: [], // 送货到家地址
      pickAdrs: [], // 上门取货地址
      items: [],
      addrMore: false,
      count: 0, // ? 选择商品的个数
      amount: 0, // ? 商品总价
      memberCount: 0, // ? 会员总价
      discount: 0, // ? 优惠价 = 商品总价 - 会员总价
      currentAddressID: '', // todo: 当前选择的收货地址ID
      currentPickUpID: ''
    };
  },
  mounted() {
    this.getCustomerAddr();
    this.getShopAddr();
    this.fetchCart( this.getUserID() ).then( data => {
      data.result.forEach( item => {
        item.commodity.pic = item.commodity.pic
          ? URLS.BaseURL + item.commodity.pic
          : '';
      } );

      this.items = data.result;
      this.total().count();
      this.total().memberCount();
      this.total().discount();
    } );
  },
  methods: {
    // todo: 计算最后金额
    total() {
      let num, memberCount;

      this.count = this.items.length;

      return {
        // todo: 计算总价
        count: () => {
          this.items.forEach( item => {
            num = item.commodity.price;
            this.amount += num;
          } );
        },

        // todo: 计算会员价
        memberCount: () => {
          this.items.forEach( item => {
            memberCount = item.commodity.commodityChannel
              ? item.commodity.commodityChannel.commodityChannelPrise
              : 0;
            this.memberCount += memberCount;
          } );
        },

        // todo: 计算优惠价
        discount: () => {
          this.discount = this.amount - this.memberCount;
          this.discount = this.discount === this.amount
            ? 0
            : this.discount;
        }
      };
    },

    // todo: 获取用户地址信息
    getCustomerAddr() {
      getCustomerReceivingAddr( {
        data: {
          userID: this.getUserID()
        }
      } ).then( data => {
        this.addrs = data.result || this.addrs;
        this.currentAddressID = this.addrs[0].receivingAddrID;
      } );
    },

    // todo: 使用其他收货地址
    showMoreAddrs() {
      this.addrMore = !this.addrMore;
    },

    // todo: 切换收货地址
    changeAddrDefault( index ) {
      let item = this.addrs.splice( index, 1 )[0];
      this.addrs.splice( 0, 0, item );
      this.addrMore = false;
      this.currentAddressID = this.addrs[index].receivingAddrID;
    },

    // todo: 去支付
    pay() {
      let info = this.$store.getters['pubStore/getCommitCartInfo'];
      if (this.checkedAddrs) {
        info.orderReceivingAddr = {
          receivingAddrID: this.currentAddressID
        };
        info.takeGoodsShopInfo = {
          shopOrgID: this.currentPickUpID
        };
        info.goodTransportType = '1' // 1 送货上门
      } else {
        info.takeGoodsShopInfo = {
          shopOrgID: this.currentPickUpID
        };
        info.goodTransportType = '2' //  2 门店自取
      };
      createOrder( {
        data: {...info}
      } ).then( data => {
        console.log( data.result );

        this.$store.dispatch( 'pubStore/changePayOrder', data.result ).then( () => {
          this.$router.push( {
            path: '/pay'
          } );
        } );
      } );
    },
    // 送货到家
    homeAddrs: function () {
      this.checkedAddrs = true
      this.getCustomerAddr();
    },
    // 上门取货
    pickUp: function () {
      this.checkedAddrs = false
      this.getShopAddr()
    },
    // 获取上门地址
    getShopAddr: function () {
      getAllShop()
        .then(data => {
          this.pickAdrs = data.result || this.pickAdrs;
          this.currentPickUpID = this.pickAdrs[0].organizationID
        })
    },
    // 改变上门取货地址
    changePickupaddr: function (index) {
      let item = this.pickAdrs.splice( index, 1 )[0];
      this.pickAdrs.splice( 0, 0, item );
      this.addrMore = false;
      this.currentPickUpID = this.pickAdrs[index].organizationID
    }
  }
};
</script>

<style lang="stylus" scoped>
  body
    position: relative
  .selectRadio
    margin: 20px 0px;
    input
      margin-left: 20px
      margin-right: 5px
  .confirm-order
    overflow: hidden
    .top
      display: flex
      align-items: center
      justify-content: space-between
      border-bottom 1px solid #F0F3F5
      margin-right: 240px
      margin-left: 310px
    .order-addr
    .confirm
      padding-left: 310px
      .icon
        background: #2D316C
        display inline-block
        width: 3px
        height: 12px
        margin-right: 10px
      .title
        padding-top: 30px
        padding-bottom: 11px
        font-size: 16px
        color: #333333
    .order-addr
      padding-right: 217px
      .title
        padding-right 10px
      .add-addr
        float right
        color: #2d316c
        font-size 14px
        cursor pointer
      .addrs
        height: 50px
        line-height: 50px
        margin: 20px 20px 15px
        overflow hidden
        font-size: 14px
        ul
          li
            background: #F4F5FB
            padding-left: 20px
            &:not( :first-child )
              cursor pointer
              &:hover
                background: #E8E9F1
        .name
          margin-right 20px
          color: #333333
          font-weight: bold
        .addr
          color: #666666
      .addr-more
        height auto
      .more
        background: url( '~assets/public/images/icon_down.png' ) right center no-repeat
        display inline-block
        margin-left: 20px
        padding-right: 13px
        font-size: 14px
        color: #2d316c
    .confirm
      padding-right: 217px
      .list
        padding-top: 20px
        margin-bottom: 20px
        .title
          display grid
          grid-template-columns 517px 1fr 1fr 1fr
          padding: 0
          font-size: 14px
        .items
          padding: 0
          font-size: 14px
          .content
            display grid
            grid-template-columns 517px 1fr 1fr 1fr
        .title
          background: #F4F5FB
          height: 40px
          line-height: 40px
          color: #999
          text-align: center
        .items
          border-bottom 1px solid #F0F3F5
          padding: 21px 0
          .pic
            display flex
            align-items center
            img
              width: 180px
          .name
            display block
            margin-bottom: 8px
          .money
          .num
          .count
            display flex
            justify-content center
            align-items center
            font-size: 14px
            color: #333333
          .count
            &:before
              content '￥'
          .num
            color: #1b1d43
          .money
            display flex
            flex-direction column
            .line-through
              i
                text-decoration line-through
          .coupon
            display block
            background #FFF7ED url( '~assets/public/images/discount_icon.png' ) 11px center no-repeat
            height 27px
            line-height 27px
            padding-left 37px
            span
              &:first-child
                margin-right 165px
                color #2D316C
              &:last-child
                color #999
    .coupon_more
      background #FFF7ED
      position relative
      margin-left 310px
      margin-right 216px
      margin-bottom 40px
      padding-top 48px
      padding-left 20px
      padding-bottom 20px
      padding-right 100px
      .title
        position absolute
        background url( '~assets/public/images/icon1.png' ) no-repeat
        width 92px
        height 32px
        line-height 32px
        top -4px
        left 10px
        text-align center
        color #fff
        font-size 16px
      .items
        display flex
        justify-content space-between
        align-items center
        img
          width 180px
          height 180px
          border 1px solid red
          margin-right 20px
        span
          &:first-child
            display flex
            align-items center

    .info
      background: #F4F5FB
      height: 50px
      line-height: 50px
      margin: 0 214px 9px 310px
      padding: 0 30px
      font-size: 14px
      color: #333333
      em
        color: #fb596d
      .count
        float right
    .price
      margin: 0 214px 0 310px
      padding-right: 20px
      margin-bottom: 20px
      font-size: 14px
      color: #999999
      span
        display block
        text-align: right
    .pay
      float: right
      background: #2d316c
      width: 150px
      height: 50px
      line-height: 50px
      margin-right: 214px
      margin-bottom: 100px
      font-size: 16px
      color: #ffffff
      text-align: center
      cursor pointer
  .cover
    position: absolute
    display flex
    display none
    justify-content center
    align-items center
    background: rgba( 0 0 0 0.5 )
    left: 0
    top: 0
    z-index: 200
    width: 100%
    height: 100%
</style>
