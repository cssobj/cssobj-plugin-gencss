// plugin for cssobj

function dashify(str) {
  return str
    .replace(/([A-Z])/g, function(m){return "-"+m.toLowerCase()})
    .replace(/(^\s+|\s+$)/g, '')
}

function cssobj_plugin_post_gencss (option) {

  option = option || {newLine: '\n'}

  return function (result) {
    var newLine = option.newLine
    var keys = Object.keys
    var str = []
    var walk = function(node) {
      if (!node) return ''

      // cssobj generate vanilla Array, it's safe to use constructor, fast
      if (node.constructor === Array) return node.map(function (v) {walk(v)})

      var postArr = []
      var children = node.children
      var isGroup = node.type=='group'

      var prop = node.prop
      var selText = node.selText

      // get cssText from prop
      var cssText = keys(prop).map(function(k) {
        for(var v, str='', i=prop[k].length; i--; ) {
          v = prop[k][i]
          str += k.charAt(0)=='@'
            ? dashify(k)+' '+v+';' + newLine
            : dashify(k)+': '+v+';' + newLine
        }
        return str
      }).join('')

      if(isGroup) {
        str.push(node.groupText+' {' + newLine)
      }

      if (cssText) str.push( selText ? selText + ' {' + newLine + cssText +'}' + newLine : cssText )

      for(var c in children) {
        if(c==='' || children[c].at=='@media ') postArr.push(c)
        else walk(children[c])
      }

      if(isGroup) {
        str.push('}' + newLine)
      }

      // media rules need a stand alone block
      postArr.map(function(v) {
        walk(children[v])
      })

    }
    walk(result.root)
    result.css = str.join('')
    return result
  }

}

export default cssobj_plugin_post_gencss;