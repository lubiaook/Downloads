path1=~/opt/release/apps/install/com.awspaas.user.apps.finance/repository/process
# 具体的文件名称
 arrayprocessFinance=(
 	obj_d1a7b93e45f44829be04b06ecd764a42
 	obj_aac33d4d031041209cdee45b34d4bbfc
 	obj_a7bb02733cf24522b4dd5a6725445188
 	obj_44dd6d3a54b1493c95fc969a1db0933b
 	obj_091be71ee59841adac1ead68134668cd
 	obj_5fb4e7967a9d414c880322a72c0a7292
 	obj_1071ff49f69b46efabcd261bb2a4d163
 	obj_cf5ce9649f8e43e09cd9fbd538fb3902
 	obj_eae7f66c30424da098f0d1e4659d95fc
 	obj_c67054d4959848d088cfbf3d1934fdd2
 	obj_8b7645dd623d4012bd26b7367ac87c78
 	obj_3fff0d22f48a4808aa6e4859c6a52d0c
 	obj_cb72e14d76084746ae79da0db1b2c54d
 	obj_5e73ecdafadd4b84933e2363872b7af2
 	)

for str in ${arrayprocessFinance[@]}
do 
find -d $path1/.  -name $str 
done 
