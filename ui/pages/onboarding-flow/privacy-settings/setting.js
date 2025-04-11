import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Icon,
  IconName,
  IconSize,
  Text,
} from '../../../components/component-library';
import ToggleButton from '../../../components/ui/toggle-button';
import {
  JustifyContent,
  TextVariant,
  AlignItems,
  Display,
  BackgroundColor,
  BorderRadius,
  FlexDirection,
  BlockSize,
  IconColor,
  TextColor,
} from '../../../helpers/constants/design-system';
import { PrivacyTags } from './privacy-tags';

export const Setting = ({
  value,
  setValue,
  title,
  descriptions,
  showToggle = true,
  dataTestId,
  disabled = false,
  tags,
  onClick,
}) => {
  return (
    <Box
      display={Display.Flex}
      flexDirection={FlexDirection.Column}
      justifyContent={JustifyContent.spaceBetween}
      alignItems={AlignItems.flexStart}
      backgroundColor={BackgroundColor.backgroundMuted}
      borderRadius={BorderRadius.LG}
      marginTop={3}
      marginBottom={3}
      paddingTop={4}
      paddingBottom={4}
      paddingLeft={4}
      paddingRight={1}
      className="privacy-settings__setting__wrapper"
      data-testid={dataTestId}
      onClick={onClick}
    >
      <Box
        display={Display.Flex}
        width={BlockSize.Full}
        justifyContent={JustifyContent.spaceBetween}
        marginBottom={1}
      >
        <Text variant={TextVariant.bodyMdMedium}>{title}</Text>
        {showToggle ? (
          <div>
            <ToggleButton
              value={value}
              onToggle={(val) => setValue(!val)}
              disabled={disabled}
            />
          </div>
        ) : null}
        {onClick ? (
          <div>
            <Icon
              name={IconName.ArrowRight}
              size={IconSize.Md}
              color={IconColor.iconAlternative}
              marginRight={3}
            />
          </div>
        ) : null}
      </Box>
      {descriptions && (
        <Box
          paddingRight={3}
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          gap={4}
        >
          {descriptions.map((description, index) => (
            <Text
              key={index}
              variant={TextVariant.bodySm}
              color={TextColor.textAlternative}
            >
              {description}
            </Text>
          ))}
        </Box>
      )}
      {tags && <PrivacyTags tags={tags} />}
    </Box>
  );
};

Setting.propTypes = {
  value: PropTypes.bool,
  setValue: PropTypes.func,
  title: PropTypes.string,
  descriptions: PropTypes.array,
  showToggle: PropTypes.bool,
  dataTestId: PropTypes.string,
  disabled: PropTypes.bool,
  tags: PropTypes.array,
  onClick: PropTypes.func,
};
