import { css } from "@emotion/css";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import React from "react";
import { ContentEditable } from "../../../../../../components/ContentEditable/ContentEditable";
import { FateLabel } from "../../../../../../components/FateLabel/FateLabel";
import { IRichTextBlock } from "../../../../../../domains/character/types";
import { RichTextEditor } from "../../../../../../molecules/RichTextEditor/RichTextEditor";
import { IBlockComponentProps } from "../../types/IBlockComponentProps";

export function BlockRichText(
  props: IBlockComponentProps<IRichTextBlock> & {}
) {
  return (
    <>
      <Box>
        <Grid container justify="space-between" wrap="nowrap" spacing={1}>
          <Grid item className={css({ flex: "1 1 auto" })}>
            <FateLabel display="inline">
              <ContentEditable
                data-cy={`character-dialog.${props.section.label}.${props.block.label}.label`}
                readonly={!props.advanced}
                border={props.advanced}
                value={props.block.label}
                onChange={(value) => {
                  props.onLabelChange(value);
                }}
              />
            </FateLabel>
          </Grid>
        </Grid>
        <Box py=".5rem">
          <RichTextEditor
            value={props.block.value}
            onChange={(value) => {
              props.onValueChange(value);
            }}
          />
        </Box>
      </Box>
    </>
  );
}
BlockRichText.displayName = "BlockRichText";