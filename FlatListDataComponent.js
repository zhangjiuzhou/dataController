'use strict'
/**
 * Created by jiuzhou.zhang on 2017/10/31.
 */

import React, { PropTypes } from 'react'
import { FlatList, View, ActivityIndicator, StyleSheet } from 'react-native'
import toast from 'components/Scene/toast'
import DataComponent from './DataComponent'
import PullRefreshScrollView from '../PullRefreshScrollView'
import NoDataView from './NoDataView'
import FooterView from './FooterView'
import { error, nativeState } from 'libs'

@toast
export default class extends React.Component {
  static propTypes = {
    loadData: PropTypes.func,
    pagination: PropTypes.bool,
    data: PropTypes.array,
    extraData: PropTypes.any,
    keyExtractor: PropTypes.func,
    renderItem: PropTypes.func,
    renderEmptyView: PropTypes.func,
    more: PropTypes.bool,
    error: PropTypes.object,
    listRef: PropTypes.func
  }

  state = {
    width: 0,
    height: 0,
    loading: false,
    refreshing: false,
    loadingMore: false,
    ready: false,
    mode: undefined,
    data: this.props.data
  }

  _showErrorToast = false

  componentWillReceiveProps (nextProps, nextState) {
    if (nextProps.data !== this.props.data) {
      this.setState({ data: nextProps.data })
    }
    if (nextProps.error !== this.props.error) {
      this._showErrorToast = true
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (nextProps.data !== this.props.data) {
      return true
    }
    if (nextProps.extraData !== this.props.extraData) {
      return true
    }
    if (nextProps.error !== this.props.error) {
      return true
    }
    for (const key in nextState) {
      if (nextState[key] !== this.state[key]) {
        return true
      }
    }

    return false
  }

  componentDidUpdate (nextProps) {
    if (this._showErrorToast) {
      this._showErrorToast = false
      this.props.showToast(error.errorMessage(this.props.error))
    }
  }

  render () {
    let data = []
    if (this.state.ready) {
      if (this.state.data && this.state.data.length > 0) {
        data = this.state.data
      } else {
        if (this.props.error) {
          const message = error.errorMessage(this.props.error) || '加载失败'
          data = [{ _type: 'error', _props: { content: message } }]
        } else {
          data = [{ _type: 'empty', _props: { content: '暂无内容' } }]
        }
      }
    }

    return <DataComponent
      ref='wrappedInstance'
      loadData={(...props) => this._loadData(...props)}
      onBeginLoad={(...props) => this._onBeginLoad(...props)}
      onEndLoad={(...props) => this._onEndLoad(...props)}
    >
      <View style={{ flex: 1 }}>
        <FlatList
          {...this.props}
          ref={ref => {
            if (this.props.listRef) {
              this.props.listRef(ref)
            }
          }}
          enableEmptySections
          data={data}
          renderScrollComponent={props => this._renderScrollComponent(props)}
          keyExtractor={item => this._keyExtractor(item)}
          renderItem={listItem => this._renderItem(listItem)}
          ListFooterComponent={() => this._renderFooter()}
          onEndReachedThreshold={1}
          onLayout={e => this._onLayout(e)}
          onEndReached={e => this._onEndReached(e)}
        />
        {this._renderActivityIndicator()}
      </View>
    </DataComponent>
  }

  _loadData (complete, mode, pageNumber) {
    if (this.props.loadData) {
      return this.props.loadData(complete, mode, pageNumber)
    } else {
      return { cancel: () => null }
    }
  }

  _onBeginLoad (mode) {
    switch (mode) {
      case DataComponent.modes.init:
      case DataComponent.modes.refresh:
        this.setState({ loading: true })
        break

      case DataComponent.modes.pullRefresh:
        this.setState({ refreshing: true })
        break

      case DataComponent.modes.loadMore:
        this.setState({ loadingMore: true })
        break
    }
  }

  _onEndLoad (mode) {
    switch (mode) {
      case DataComponent.modes.init:
      case DataComponent.modes.refresh:
        this.setState({
          ready: true,
          loading: false,
          mode: mode
        })
        break

      case DataComponent.modes.pullRefresh:
        this.setState({
          refreshing: false,
          mode: mode
        })
        break

      case DataComponent.modes.loadMore:
        this.setState({
          loadingMore: false,
          mode: mode
        })
        break
    }
  }

  _renderEmpty (props) {
    return this.state.width > 0 && <View style={{
      width: this.state.width,
      height: this.state.height
    }}>
      <NoDataView {...props} />
    </View>
  }
  _renderEmptyViewFromProps (item, index) {
    return (this.state.width > 0 && !this.state.refreshing && !this.state.loading && !this.state.loadingMore) && <View style={{
      width: this.state.width,
      height: this.state.height
    }}>
      {this.props.renderEmptyView(item, index)}
    </View>
  }

  _renderScrollComponent (props) {
    return <PullRefreshScrollView
      {...props}
      refreshing={this.state.refreshing}
      onRefresh={() => {
        if (this.refs.wrappedInstance) {
          this.refs.wrappedInstance.pullRefresh()
        }
      }}
    />
  }

  _keyExtractor (item) {
    if (item._type) {
      return 'system'
    } else {
      if (item.toJS) {
        item = item.toJS()
      }
      if (this.props.keyExtractor) {
        return this.props.keyExtractor(item)
      } else {
        return item.props.key
      }
    }
  }

  _renderItem ({ item, index }) {
    if (this.props.renderEmptyView && item._type) {
      return this._renderEmptyViewFromProps(item, index)
    } else if (item._type) {
      return this._renderEmpty(item._props)
    } else {
      if (item.toJS) {
        item = item.toJS()
      }
      if (this.props.renderItem) {
        return this.props.renderItem(item, index)
      } else {
        let Element = item['component']
        let props = item['props'] || {}
        return <Element key={props.key} {...props} />
      }
    }
  }

  _renderFooter () {
    // 不支持分页、只有一页、正在刷新时不显示上拉加载视图
    if (!this.props.pagination ||
      (this.state.mode !== DataComponent.modes.loadMore && !this.props.more) ||
      this.state.loading ||
      this.state.refreshing
    ) {
      return null
    }

    let state
    if (this.state.loadingMore) {
      state = FooterView.states.loading
    } else if (!this.props.more) {
      state = FooterView.states.noMore
    } else {
      state = FooterView.states.default
    }

    return <FooterView state={state} />
  }

  _renderActivityIndicator () {
    return this.state.loading && <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
      <View style={{
        backgroundColor: '#3336',
        borderRadius: 10,
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ActivityIndicator size='large' color='#fff' />
      </View>
    </View>
  }

  _onLayout (e) {
    this.setState({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height
    })

    if (this.props.onLayout) {
      this.props.onLayout(e)
    }
  }

  _onEndReached (e) {
    if (!this.props.pagination || !this.props.more || this.state.loading || this.state.refreshing) {
      return
    }

    if (this.refs.wrappedInstance) {
      this.refs.wrappedInstance.loadMore()
    }

    if (this.props.onEndReached) {
      this.props.onEndReached(e)
    }
  }
}
