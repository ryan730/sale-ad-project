//- Created by ryan.zhu on 2017/11/8.
//- ......(\_/)
//- ......( '_')
//- ..../"NOBUG"\======░ ▒▓▓█D
//- /"""""""""""""""""""\
//- \_@_@_@_@_@_@_@/
//-

<template lang='pug'>
    .mod-table
        el-table(v-if='tablaType==="customer"',:data='tableData', border='', style='width: 100%')
            el-table-column(prop='name', label='姓名', width='200')
            el-table-column(prop='customType', label='类型', width='200')
            el-table-column(prop='mobile', label='电话', width='200')
            el-table-column(prop='followEmployeeID', label='所有人', width='200')
            el-table-column(prop='action', label='操作')
                template(slot-scope='scope')
                    el-button(@click='handleClick(scope.row,"customer")', type='text', size='small') 查看
                    //-el-button(type='text', size='small') 删除

        el-table(v-if='tablaType==="marketing"',:data='tableData', border='', style='width: 100%')
            el-table-column(prop='name', label='订单号', width='150')
            el-table-column(prop='customType', label='商品', width='150')
            el-table-column(prop='mobile', label='金额', width='150')
            el-table-column(prop='followEmployeeID', label='订单状态', width='150')
            el-table-column(prop='followEmployeeID', label='客户名称', width='150')
            el-table-column(prop='followEmployeeID', label='订单类型', width='150')
            el-table-column(prop='followEmployeeID', label='订单创建人', width='150')
            el-table-column(prop='action', label='操作')
                template(slot-scope='scope')
                    el-button(@click='handleClick(scope.row,"marketing")', type='text', size='small') 结账
                    //-el-button(type='text', size='small') 删除

        el-table(v-if='tablaType==="stocks-0"',:data='tableData', border='', style='width: 100%')
            el-table-column(prop='name', label='商品编号', width='300')
            el-table-column(prop='customType', label='商品名称', width='600')
            el-table-column(prop='followEmployeeID', label='库存')

        el-table(v-if='tablaType==="stocks-1"',:data='tableData', border='', style='width: 100%')
            el-table-column(prop='name', label='入库类型', width='300')
            el-table-column(prop='customType', label='订单编码/领料单编码', width='300')
            el-table-column(prop='mobile', label='操作人 ', width='300')
            el-table-column(prop='followEmployeeID', label='入库时间')

        el-table(v-if='tablaType==="stocks-2"',:data='tableData', border='', style='width: 100%')
            el-table-column(prop='name', label='订单编号', width='300')
            el-table-column(prop='customType', label='订单类型', width='300')
            el-table-column(prop='mobile', label='操作人 ', width='300')
            el-table-column(prop='followEmployeeID', label='出库时间')

        el-table(v-if='tablaType==="requisition-0"',:data='tableData', border='', style='width: 100%')
            el-table-column(prop='name', label='调库申请单号', width='200')
            el-table-column(prop='customType', label='申请人', width='200')
            el-table-column(prop='mobile', label='所在店面', width='200')
            el-table-column(prop='followEmployeeID', label='状态', width='200')
            el-table-column(prop='followEmployeeID', label='申请时间', width='200')
            el-table-column(prop='action', label='操作')
                template(slot-scope='scope')
                    el-button(@click='handleClick(scope.row,"requisition-0")', type='text', size='small') 查看
                    //-el-button(type='text', size='small') 删除

        el-table(v-if='tablaType==="requisition-1"',:data='tableData', border='', style='width: 100%')
            el-table-column(prop='name', label='商品编号', width='250')
            el-table-column(prop='customType', label='商品名称', width='250')
            el-table-column(prop='mobile', label='库存数', width='250')
            el-table-column(prop='followEmployeeID', label='申请调货量', width='250')
            el-table-column(prop='followEmployeeID', label='批准调货量')

</template>

<script>
import conf from "@/config/conf";
function $jsonToParams(data) {
  var param = "";
  for (var prop in data) {
    param += prop + "=" + data[prop] + "&";
  }
  param = param.substring(0, param.length - 1);
  return param;
}
export default {
  data() {
    return {};
  },
  props: {
    tablaType: {
      type: String,
      required: true,
      default: ""
    },
    tableData: {
      type: Array,
      required: true,
      default: []
    }
  },
  methods: {
    handleClick(...arg) {
      console.log("mod-table-click:", arg);
      let params = $jsonToParams(arg[0]);
      let type = arg[1];
      if (type && typeof type === "string") {
        switch (type) {
          case "customer":
            this.$router.push("/customer/details" + "?" + params);
            break;
          case "marketing":
            this.$router.push("/marketing/details" + "?" + params);
            break;
          case "requisition-":
            break;
        }
      }
    }
  }
};
</script>
<style lang='stylus'>
@import '~::libs/hotcss/px2rem.styl';

.m-select {
    float: right;
    width: $px2rem(260px);
    height: $px2rem(40px);
    line-height: $px2rem(40px);
}

.mod-table {
    .el-table__header-wrapper {
        table {
            thead {
                tr {
                    background: $color(s-car);
                    color: white;
                }
            }
        }
    }
}
</style>
