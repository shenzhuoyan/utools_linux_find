const { exec } = require('child_process')
const fs = require('fs');
const version = 4
window.exec = function (keyword, callback) {
    exec(`~/.config/findlinux/find.sh `+keyword, (err, stdout, stderr) => {
      if (err) {
        console.log("无结果")
        callback()//没结果返回个null
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
          // 注意更新时修改当前版本
          // 判断是否已有配置（第一次安装）或版本是否需要升级
          
          exec("if [ ! -f ~/.config/findlinux/version ] || [ "+version+" -gt `cat ~/.config/findlinux/version` ];"+
          "then echo yes; else echo no ;fi",(err, stdout, stderr)=>{
            console.log(stdout)
            if(stdout=="yes\n"){// 如果文件不存在或者版本比当前低就重新生成
              console.log("文件不存在")
              exec(`mkdir -p ~/.config/findlinux`,(err, stdout, stderr)=>{})
              // 重新生成文件
              exec(`echo "#\!/bin/bash\n# 判断命令是哪个\nif hash fdfind 2>/dev/null; then\ncmd=fdfind\nelse cmd=fd-find\nfi\n`+
              `# 参数如下\n# --search-path 从用户家目录下搜索\n# --max-results 120 只显示最多120条\n`+
              `# -F 字符串只当作文本而不是正则表达式\n# -a 显示全路径\n# 更多参数使用 man fdfind 或 man fd-find\n`+
              `# 如果输入的不止1个字母\nif (( \\$\{#1\} > 1 ));then\nresult=\\$(\\$cmd --search-path ~ -Fa \\$1)\nshift\n`+
              `for arg in \\$*;do result=\\$(echo \\"\\$result\\" | grep \\$arg);done\ncount=0\n`+
              `echo \\"\\$result\\" | while read line;do\ncount=\\$((\\$count+1))\necho \\$line\n`+
              `if [ \\$count = 120 ];then\nbreak\nfi\ndone\nelse\n# 只输入一个字母就进行精准匹配\n`+
              `\\$cmd --search-path ~ -Fa \\$1 | grep \\"/\\$1\\$\\"\nfi" > ~/.config/findlinux/find.sh`,(err, stdout, stderr)=>{})
              // 记录本地版本
              exec(`echo `+version+` > ~/.config/findlinux/version`)
              // 添加执行权限
              exec(`chmod +x ~/.config/findlinux/find.sh`,(err, stdout, stderr)=>{})
            }
            else console.log("文件存在")
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
              // console.log(content)
              if(content!=null){//如果搜索结果是空，列表就置空
                //解决了关键词没结果的时候列表还是上次结果的bug
                for(var item of content.split("\n")){
                  if(item!="")
                    arr.push({
                      title:item,
                      description:fs.statSync(item).isFile()?"文件":"目录",
                      url:item,
                      isFile:fs.statSync(item).isFile()
                    });
                }
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
            if(itemData.isFile) exec("xdg-open '"+itemData.url+"' &",(err, stdout, stderr)=>{})
            else utools.shellShowItemInFolder(itemData.url)
        },
        // 子输入框为空时的占位符，默认为字符串"搜索"
        placeholder: "搜索"
     } 
  },

}
