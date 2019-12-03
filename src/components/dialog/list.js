import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ViewPropTypes } from 'react-native';
import { RatioUtils } from '../../utils';
import TYFlatList from '../TYLists/list';
import TYText from '../TYText';
import { StyledContainer, StyledContent, StyledTitle, StyledSubTitle, StyledList } from './styled';

const { convertX: cx } = RatioUtils;

const ITEM_HEIGHT = 56;

export default class List extends Component {
  static propTypes = {
    maxItemNum: PropTypes.number,
    dataSource: PropTypes.array.isRequired,
    style: ViewPropTypes.style,
    contentStyle: ViewPropTypes.style,
    listStyle: ViewPropTypes.style,
    titleNumberOfLines: PropTypes.number,
    title: PropTypes.string.isRequired,
    titleStyle: TYText.propTypes.style,
    subTitle: PropTypes.string,
    subTitleStyle: TYText.propTypes.style,
  };

  static defaultProps = {
    maxItemNum: 5,
    style: null,
    contentStyle: null,
    listStyle: null,
    titleStyle: null,
    titleNumberOfLines: 2,
    subTitle: '',
    subTitleStyle: null,
  };

  renderItem = ({ item }) => {
    const { styles = {}, ...props } = item;
    return (
      <TYFlatList.Item
        styles={{
          ...styles,
          container: [{ height: ITEM_HEIGHT, justifyContent: 'center' }, styles.container],
          contentCenter: [{ alignItems: 'center' }, styles.contentCenter],
          title: [
            {
              fontWeight: '500',
              fontSize: cx(16),
            },
            styles.title,
          ],
        }}
        {...props}
      />
    );
  };

  render() {
    const {
      maxItemNum,
      dataSource,
      style,
      contentStyle,
      listStyle,
      titleNumberOfLines,
      title,
      titleStyle,
      subTitle,
      subTitleStyle,
      ...TYFlatListProps
    } = this.props;
    return (
      <StyledContainer style={style}>
        <StyledContent
          style={[{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }, contentStyle]}
        >
          <StyledTitle style={titleStyle} numberOfLines={titleNumberOfLines}>
            {title}
          </StyledTitle>
          {!!subTitle && <StyledSubTitle style={subTitleStyle}>{subTitle}</StyledSubTitle>}
          <StyledList
            style={[listStyle, { maxHeight: maxItemNum * ITEM_HEIGHT + cx(16) }]}
            scrollEnabled={dataSource.length > maxItemNum}
            keyExtractor={(item, idx) => item.key || idx}
            data={dataSource}
            renderItem={this.renderItem}
            {...TYFlatListProps}
          />
        </StyledContent>
      </StyledContainer>
    );
  }
}