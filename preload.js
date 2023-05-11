const { exec } = require('child_process')
const fs = require('fs');
window.exec = function (keyword, callback) {
    exec("~/.config/findlinux/find.sh "+keyword, (err, stdout, stderr) => {
      if (err) {
        console.log("执行错误")
        return 0
      }
      callback(stdout)
      return 1
    })
}

window.exports = {
  "搜索": { // 注意：键对应的是 plugin.json 中的 features.code
     mode: "list",  // 列表模式
     args: {
        // 进入插件应用时调用（可选）
        enter: (action, callbackSetList) => {
          //console.log("进入插件")
          exec("if [ ! -f ~/.config/findlinux/find.sh ]; then echo yes; else echo no ;fi",(err, stdout, stderr)=>{
            console.log(stdout)
            if(stdout=="yes\n"){// 如果文件不存在就创建
              console.log("文件不存在")
              exec("mkdir ~/.config/findlinux -p",(err, stdout, stderr)=>{})
              exec('echo "#\!/bin/bash\n'+
                    '# 判断命令是哪个\n'+
                    'if hash fdfind 2>/dev/null; then\ncmd=\"fdfind\"\nelse cmd=\"fd-find\"\nfi\n'+
                    '# 参数如下\n# --search-path 从用户家目录下搜索\n'+
                    '# --max-results 60 只显示最多60条\n'+
                    '# -F 字符串只当作文本而不是正则表达式\n'+
                    '# -a 显示全路径\n'+
                    '# 更多参数使用 man fdfind 或 man fd-find\n'+
                    'result=\\`\\$cmd --search-path ~ -Fa \\$1\\`\n'+
                    'shift\n'+
                    'for arg in \\$*;do result=\\`echo \\"\\$result\\" | grep \\$arg\\`;done\n'+
                    'count=0\n'+
                    'echo \\"\\$result\\" | while read line;do\n'+
                    'count=\\$((\\$count+1))\n'+
                    'echo \\$line\n'+
                    'if [ \\$count = 60 ];then\n'+
                    'break\nfi\n'+
                    'done" > ~/.config/findlinux/find.sh',(err, stdout, stderr)=>{})
              exec('chmod +x ~/.config/findlinux/find.sh',(err, stdout, stderr)=>{})
            }
          })
        },
        // 子输入框内容变化时被调用 可选 (未设置则无搜索)

        search: (action, searchWord, callbackSetList) => {
           // 获取一些数据
           // 参数 F 的意思是特殊字符不特殊（如“+”就当个字符来匹配）
           // 参数 a 绝对路径
           // 执行 callbackSetList 显示出来
           var arr = []
           if(searchWord!=""){//如果有输入，就搜索并展示结果
            window.exec(searchWord,function(content){
                
                
                  for(var item of content.split("\n")){
                    if(item!="")
                      arr.push({
                        title:item,
                        description:fs.statSync(item).isFile()?"文件":"目录",
                        url:item,
                        isFile:fs.statSync(item).isFile()
                      });
                  }
                  callbackSetList(arr) 
              })
            }
            else {
              utools.setExpendHeight(0) //如果没输入，就把展示框关掉
              callbackSetList()
            }
          
        },
        // 用户选择列表中某个条目时被调用
        select: (action, itemData, callbackSetList) => {
            
            window.utools.hideMainWindow()
            // const url = itemData.url
            //require('electron').shell.openExternal(url)
            //window.utools.outPlugin()
            if(itemData.isFile) utools.shellOpenPath(itemData.url)
            else utools.shellShowItemInFolder(itemData.url)
        },
        // 子输入框为空时的占位符，默认为字符串"搜索"
        placeholder: "搜索"
     } 
  },

}
