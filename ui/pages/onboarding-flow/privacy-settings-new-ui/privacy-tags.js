import React from 'react';
import PropTypes from 'prop-types';
import { PRIVACY_TAGS } from '../../../helpers/constants/privacy-tags';
import { Box, Text } from '../../../components/component-library';
import {
  BackgroundColor,
  Display,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';

const TAG_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
};

const PRIVACY_TAGS_DATA = {
  [PRIVACY_TAGS.IP_ADDRESS]: {
    type: TAG_TYPES.WARNING,
    label: 'IP Address',
  },
  [PRIVACY_TAGS.METAMASK_API]: {
    type: TAG_TYPES.SUCCESS,
    label: 'MetaMask API',
  },
  [PRIVACY_TAGS.THIRD_PARTY]: {
    type: TAG_TYPES.WARNING,
    label: 'Third Party',
  },
  [PRIVACY_TAGS.ACCOUNT_ADDRESS]: {
    type: TAG_TYPES.WARNING,
    label: 'Account Address',
  },
  [PRIVACY_TAGS.IMPROVES_SAFETY]: {
    type: TAG_TYPES.SUCCESS,
    label: 'Improves Safety',
  },
};

const TAG_TYPES_STYLE = {
  [TAG_TYPES.SUCCESS]: {
    background: BackgroundColor.successMuted,
    color: TextColor.successDefault,
  },
  [TAG_TYPES.WARNING]: {
    background: BackgroundColor.warningMuted,
    color: TextColor.warningDefault,
  },
  [TAG_TYPES.INFO]: {
    background: BackgroundColor.infoMuted,
    color: TextColor.infoDefault,
  },
};

export const PrivacyTags = ({ tags }) => {
  return (
    <Box display={Display.Flex} gap={2} marginTop={2}>
      {tags.map((tag) => {
        const tagData = PRIVACY_TAGS_DATA[tag] || {
          type: TAG_TYPES.INFO,
          label: tag,
        };
        return (
          <Box
            key={tag}
            backgroundColor={TAG_TYPES_STYLE[tagData.type].background}
            className="privacy-settings__tag"
          >
            <Text
              variant={TextVariant.bodyXsMedium}
              color={TAG_TYPES_STYLE[tagData.type].color}
            >
              {tagData.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

PrivacyTags.propTypes = {
  tags: PropTypes.array,
};
