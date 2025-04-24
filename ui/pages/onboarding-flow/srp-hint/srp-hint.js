import React from 'react';
import { useHistory } from 'react-router-dom';
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
import { ONBOARDING_COMPLETION_ROUTE } from '../../../helpers/constants/routes';

export default function SRPHint() {
  const history = useHistory();

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
          Password hint
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
        className="srp-hint__actions"
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.center}
      >
        <Button
          data-testid="srp-hint-save"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Lg}
          width={BlockSize.Full}
          onClick={() => history.push(ONBOARDING_COMPLETION_ROUTE)}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
}
