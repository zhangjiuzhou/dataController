'use strict'
/**
 * Created by jiuzhou.zhang on 2017/11/1.
 */

import React, { PropTypes } from 'react'
import { View, ActivityIndicator } from 'react-native'
import Text from '../Text'

const loadMoreStates = {
  default: 'default',
  loading: 'loading',
  noMore: 'noMore'
}

export default class extends React.Component {
  static propTypes = {
    state: PropTypes.string
  }

  static defaultProps = {
    state: loadMoreStates.default
  }

  static states = loadMoreStates

  shouldComponentUpdate (nextProps) {
    return nextProps.state !== this.props.state
  }

  render () {
    let { state } = this.props
    let text

    switch (state) {
      case loadMoreStates.default:
        text = '上拉查看更多'
        break
      case loadMoreStates.loading:
        text = '正在加载...'
        break
      case loadMoreStates.noMore:
        text = '没有更多数据了'
        break
    }

    return (<View style={{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      height: 40
    }}>
      {state === loadMoreStates.loading && <ActivityIndicator size='small' color='gray' />}
      <Text style={{
        marginLeft: 10,
        fontSize: 15,
        color: 'gray'
      }}>{text}</Text>
    </View>)
  }
}
