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
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';

export const Setting = ({
  value,
  setValue,
  title,
  description,
  showToggle = true,
  dataTestId,
  disabled = false,
  tags,
  onClick,
}) => {
  const t = useI18nContext();

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
      <Box paddingRight={3}>{description}</Box>
      {tags && (
        <Box display={Display.Flex} gap={2} marginTop={2}>
          {tags}
        </Box>
      )}
    </Box>
  );
};

Setting.propTypes = {
  value: PropTypes.bool,
  setValue: PropTypes.func,
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  showToggle: PropTypes.bool,
  dataTestId: PropTypes.string,
  disabled: PropTypes.bool,
  tags: PropTypes.object,
  onClick: PropTypes.func,
};
