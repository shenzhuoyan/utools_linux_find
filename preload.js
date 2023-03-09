const { exec } = require('child_process')
const fs = require('fs');
window.exec = function (keyword, callback) {
  function find(cmd){
    exec(cmd+" -Fa "+keyword, (err, stdout, stderr) => {
      if (err) {
        console.log("执行出错")
        return 0
      }
      callback(stdout)
      return 1
    })
  }
  if(!find("fd")) find("fdfind") //如果fd执行出错，就执行fdfind
}
window.exports = {
  "搜索": { // 注意：键对应的是 plugin.json 中的 features.code
     mode: "list",  // 列表模式
     args: {
        // 进入插件应用时调用（可选）
        // enter: (action, callbackSetList) => {
        //    // 如果进入插件应用就要显示列表数据
        //    callbackSetList([
        //          {
        //             title: '这是标题',
        //             description: '这是描述',
        //             icon:'' // 图标(可选)
        //          }
        //    ])
        // },
        // 子输入框内容变化时被调用 可选 (未设置则无搜索)
        search: (action, searchWord, callbackSetList) => {
           // 获取一些数据
           // 参数 F 的意思是特殊字符不特殊（如“+”就当个字符来匹配）
           // 参数 a 绝对路径
           window.exec(searchWord,function(content){
              // 执行 callbackSetList 显示出来
              var arr = new Array()
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
