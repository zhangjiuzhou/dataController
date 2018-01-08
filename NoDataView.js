'use strict'
/**
 * Created by jiuzhou.zhang on 17/3/16.
 */

import React from 'react'
import PropTypes from 'prop-types'
import ImageSourcePropType from 'ImageSourcePropType'
import { View, Image } from 'react-native'
import Text from 'components/Text'

class NoDataView extends React.Component {
  static propTypes = {
    content: PropTypes.string,
    icon: ImageSourcePropType
  }

  static defaultProps = {
    content: '暂无内容'
  }

  get isScrollView () {
    return true
  }

  render () {
    let { content } = this.props
    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {this.props.icon && <Image
          source={this.props.icon}
        />}
        <Text
          style={{
            color: '#999',
            fontSize: 14,
            marginTop: 10
          }}
        >{content}</Text>
      </View>
    )
  }
}

export default NoDataView
