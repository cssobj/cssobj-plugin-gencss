// plugin for cssobj

function dashify(str) {
  return str
    .replace(/([A-Z])/g, function(m){return "-"+m.toLowerCase()})
    .replace(/(^\s+|\s+$)/g, '')
}

export default function cssobj_plugin_post_gencss (option) {

  var indentStr = 'indent' in option ? option.indent : '  '
  var newLine = 'newline' in option ? option.newLine : '\n'

  return function (result) {
    var str = []
    var walk = function(node, indent) {
      if (!node) return ''

      // cssobj generate vanilla Array, it's safe to use constructor, fast
      if (node.constructor === Array) return node.map(function (v) {walk(v,indent)})

      var prop = node.prop
      var selText = node.selText
      var groupText = node.groupText

      // child node (but not "" key) will add indent
      if(node.parentRule && !node.ruleNode) indent += indentStr

      // media node will reset indent
      if(node.at=='media') indent = ''

      var postArr = []
      var children = node.children
      var isGroup = node.type=='group'

      // groupNode if have selText, add indent
      var indent2 = selText&&isGroup ? indent + indentStr :indent

      // node have not any selector will have no indent in cssText, else add indent in prop
      var indent3 = !selText && !groupText ? '' : indent2 + indentStr

      // get cssText from prop
      var cssText = Object.keys(prop).map(function(k) {
        for(var v, str='', i=prop[k].length; i--; ) {
          v = prop[k][i]
          str += /^\s*@/.test(k)
            ? indent3 + dashify(k)+' '+v+';' + newLine
            : indent3 + dashify(k)+': '+v+';' + newLine
        }
        return str
      }).join('')

      if(isGroup) {
        str.push(indent + groupText+' {' + newLine)
      }

      if (cssText) str.push(indent2+ (selText ? selText + ' {' + newLine + cssText + indent2 + '}' + newLine : cssText ))

      for(var c in children) {
        if(c==='' || children[c].at=='media') postArr.push(c)
        else walk(children[c], indent)
      }

      if(isGroup) {
        str.push(indent+'}' + newLine)
      }

      // media rules need a stand alone block
      postArr.map(function(v) {
        walk(children[v],indent)
      })

    }
    walk(result.root, '')
    result.css = str.join('')
    return result
  }

}
