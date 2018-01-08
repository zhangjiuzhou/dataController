'use strict'
/**
 * Created by jiuzhou.zhang on 2017/10/31.
 */

import React, { PropTypes } from 'react'

const modes = {
  init: 0,
  refresh: 1,
  pullRefresh: 2,
  loadMore: 3
}

export default class extends React.PureComponent {
  static propTypes = {
    loadData: PropTypes.func,
    onBeginLoad: PropTypes.func,
    onEndLoad: PropTypes.func
  }

  static modes = modes

  _handler
  _initialized = false
  _loadingFlag = 0
  _pageNumber = 1

  load (mode = null) {
    mode = mode === null ? this._initialized ? modes.refresh : modes.init : mode
    this._load(mode)
    this._initialized = true
  }

  pullRefresh () {
    this._load(modes.pullRefresh)
  }

  loadMore () {
    this._load(modes.loadMore)
  }

  cancel () {
    if (!this._handler) {
      return
    }

    this._handler.cancel()
  }

  componentWillUnmount () {
    this.cancel()
  }

  render () {
    return this.props.children || null
  }

  _load (mode) {
    if (this.props.onBeginLoad) {
      this.props.onBeginLoad(mode)
    }
    if (this._loadingFlag > 0) {
      this.cancel()
    }

    this._loadingFlag += 1

    this._handler = this.props.loadData(() => {
      this._loadingFlag -= 1
      this._handler = null

      if (this.props.onEndLoad) {
        this.props.onEndLoad(mode)
      }
    }, mode)
  }
}
