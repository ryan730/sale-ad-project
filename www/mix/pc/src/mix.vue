<template lang="pug">
    #mix
        pub(v-if='businessLine()==="pub"')
        emp(v-if='businessLine()==="emp"')
</template>

<script>
    import pub from '@/main/pub.vue';
    import emp from '@/main/emp.vue';
    export default {
        name: 'mix',
        data(){
            return {
                businessLine: () => {
                    let business = '';
                    let rtName = this.$route.name;
                    if (rtName && rtName.length > 0) {
                        business = rtName.split('-')[0];
                    }
                    return business;
                }
            }
        },
        components: {
            pub,
            emp
        }
    };
</script>

<style lang="stylus">
    #main
        display block
</style>
