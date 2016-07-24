// helper functions for cssobj

// set default option (not deeply)
function defaults(options, defaultOption) {
  options = options || {}
  for (var i in defaultOption) {
    if (!(i in options)) options[i] = defaultOption[i]
  }
  return options
}

// convert js prop into css prop (dashified)
function dashify(str) {
  return str.replace(/[A-Z]/g, function(m) {
    return '-' + m.toLowerCase()
  })
}

// repeat str for num times
function repeat(str, num) {
  return new Array(num+1).join(str)
}

function cssobj_plugin_post_gencss (option) {

  option = defaults(option, {
    indent: '  ',
    initIndent: '',
    newLine: '\n'
  })

  var newLine = option.newLine
  var indentStr = option.indent

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
      if(node.parentRule && !node.ruleNode && !node.selParent) indent += 1

      // media node will reset indent
      if(node.at=='media') indent = 0

      var children = node.children
      var isGroup = node.type=='group'

      // groupNode if have selText, add indent
      // indent for sel
      var indent2 = selText&&isGroup ? indent + 1 :indent

      // node have not any selector will have no indent in cssText
      // indent for prop
      var indent3 = !selText && !groupText ? 0 : indent2 + 1

      // get cssText from prop
      var cssText = Object.keys(prop).map(function(k) {
        for(var v, str='', i=prop[k].length; i--; ) {
          v = prop[k][i]
          str += /^\s*@/.test(k)
            ? repeat(indentStr, indent3) + dashify(k)+' '+v+';' + newLine
            : repeat(indentStr, indent3) + dashify(k)+': '+v+';' + newLine
        }
        return str
      }).join('')

      if(isGroup) {
        str.push([indent, groupText+' {' + newLine])
      }

      if (cssText) str.push(selText ? [indent2, selText + ' {' + newLine + cssText] : cssText )

      for(var c in children) {
        walk(children[c],indent)
      }

    }
    walk(result.root, 0)

    result.css = str.concat([[0, '']]).map(function(v, i) {
      if(typeof v=='string') return v
      var num = -1
      if(i) {
        var level = str[i - 1][0]
        num = level - v[0]
      }
      for (var closeStr = ''; num >= 0; num--) {
        closeStr += repeat(indentStr, level--) + '}' + newLine
      }
      return closeStr + repeat(indentStr, v[0]) + v[1]
    }).join('')
    return result
  }

}

export default cssobj_plugin_post_gencss;