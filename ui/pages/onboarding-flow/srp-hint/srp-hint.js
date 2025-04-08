import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/component-library/button';
import {
  TextVariant,
  Display,
  AlignItems,
  JustifyContent,
  FlexDirection,
  BlockSize,
  BorderRadius,
  TextColor,
} from '../../../helpers/constants/design-system';
import { Box, Text, TextField } from '../../../components/component-library';

export default function SRPHint() {
  return (
    <Box
      className="srp-hint"
      data-testid="srp-hint"
      display={Display.Flex}
      flexDirection={FlexDirection.Column}
    >
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.flexStart}
      >
        <Text
          variant={TextVariant.headingLg}
          as="h2"
          justifyContent={JustifyContent.center}
          style={{
            alignSelf: AlignItems.flexStart,
          }}
          marginBottom={4}
        >
          Secret Recovery Phrase hint
        </Text>
        <Text
          variant={TextVariant.bodyMd}
          color={TextColor.textAlternative}
          marginBottom={6}
        >
          Leave yourself a hint to help remember where your Secret Recovery
          Phrase is stored. This hint is stored on your device, and won’t be
          shared.
        </Text>
        <Text
          variant={TextVariant.bodyMd}
          color={TextColor.textAlternative}
          marginBottom={6}
        >
          Remember: If you lose this phrase, you won’t be able to use your
          wallet.
        </Text>
        <TextField
          placeholder="e.g. mom’s home"
          width={BlockSize.Full}
          borderRadius={BorderRadius.LG}
        />
      </Box>

      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.center}
        marginTop={6}
      >
        <Button
          data-testid="srp-hint-save"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Lg}
          width={BlockSize.Full}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
}
