#!/bin/sh 

echo “开始同步-广隆商贸-pc”

salestaff=/Users/ryan/company_work/outPro/hotelManager/project/sale-staff/
excludePath=/Users/ryan/company_work/outPro/sale/src/www/customer/exclude.list
pcPath=/Users/ryan/company_work/outPro/sale/src/www/customer/pc/

rsync -av --delete --exclude-from=$excludePath $salestaff $pcPath