//- Created by ryan.zhu on 2017/11/7.
//- ......(\_/)
//- ......( '_')
//- ..../"NOBUG"\======░ ▒▓▓█D
//- /"""""""""""""""""""\
//- \_@_@_@_@_@_@_@/
//-
<template lang='pug'>
    .page-customer-details
        .m-block
            //-mod-form
            mod-info(:infoData='infoData',:infoType='infoType')
        .m-buttom-table
            .m-table
                mod-table(:tableData='tableData',:tablaType='tablaType')
</template>

<script>
    import modForm from '::mod/mod-form';
    import modTable from '::mod/mod-table';
    import modInfo from '::mod/mod-info';

    export default {
        data(){
            return {
                tablaType:'requisition-1',
                infoType:'requisition-1',
                infoData:{}
            }
        },
        created(){
            this.apiGetAllUser();
        },
        methods:{
            async apiGetAllUser(){
                this.tableData=[];//置空之前数据
                try {
                    //status:客户状态(默认有效客户)
                    //pageNum:页码（默认第一页）
                    //pageSize:每页显示条数（默认10条）
                    const res = await getAllUser({status:'1',pageNum:'1',pageSize:'10'});
                    console.log('getAllUser-result:',res.result);
                    if (res.result && res.result && res.result.content.length > 0) {
                        this.tableData = res.result.content;
                    } else {
                        throw new Error(res.msg)
                    }
                } catch (err) {
                    console.log('err:', err)

                }
            }
        },
        components: {
            modForm,
            modTable,
            modInfo
        }
    }
</script>

<style lang="stylus">
    @import '~::libs/hotcss/px2rem.styl'
    .page-customer-details
        //background gray
        overflow hidden
        .m-block
            padding $px2rem(10px 30px)
            overflow hidden
        .m-buttom-table
            padding $px2rem(10px 30px)
            overflow hidden
</style>
