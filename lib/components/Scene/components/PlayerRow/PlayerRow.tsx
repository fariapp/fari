import { css } from "@emotion/css";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Link from "@material-ui/core/Link";
import useTheme from "@material-ui/core/styles/useTheme";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import DirectionsRunIcon from "@material-ui/icons/DirectionsRun";
import EmojiPeopleIcon from "@material-ui/icons/EmojiPeople";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import RemoveCircleOutlineOutlinedIcon from "@material-ui/icons/RemoveCircleOutlineOutlined";
import React from "react";
import { useLogger } from "../../../../contexts/InjectionsContext/hooks/useLogger";
import { CharacterSelector } from "../../../../domains/character/CharacterSelector";
import { IDataCyProps } from "../../../../domains/cypress/types/IDataCyProps";
import { IRollDiceOptions } from "../../../../domains/dice/Dice";
import { Font } from "../../../../domains/font/Font";
import { useLightBackground } from "../../../../hooks/useLightBackground/useLightBackground";
import { IPlayer } from "../../../../hooks/useScene/IScene";
import { useTextColors } from "../../../../hooks/useTextColors/useTextColors";
import { useTranslate } from "../../../../hooks/useTranslate/useTranslate";
import { usePointCounter } from "../../../../routes/Character/components/CharacterDialog/components/blocks/BlockPointCounter";
import { CharacterCircleBox } from "../../../../routes/Character/components/CharacterDialog/components/CharacterCircleBox";
import { ConditionalWrapper } from "../../../ConditionalWrapper/ConditionalWrapper";
import { ContentEditable } from "../../../ContentEditable/ContentEditable";
import {
  DiceBonusLabel,
  DiceBox,
  DiceBoxResult,
} from "../../../DiceBox/DiceBox";

export const PlayerRow: React.FC<
  {
    player: IPlayer;
    readonly: boolean;
    renderControls: boolean;
    highlight: boolean;

    onDiceRoll(options: IRollDiceOptions): void;
    onPlayedInTurnOrderChange(playedDuringTurn: boolean): void;
    onPointsChange(newPoints: string, newMaxPoints: string | undefined): void;

    onPlayerRemove(): void;
    onCharacterSheetOpen(): void;
    onLoadCharacterSheet(): void;
  } & IDataCyProps
> = (props) => {
  const theme = useTheme();
  const { t } = useTranslate();
  const logger = useLogger();

  const mainPointerBlock = CharacterSelector.getCharacterMainPointerBlock(
    props.player.character
  );
  const pointFromProps = mainPointerBlock?.value ?? props.player.points;
  const maxPointsFromProps = mainPointerBlock?.meta.max ?? undefined;

  const pointsManager = usePointCounter({
    points: pointFromProps,
    maxPoints: maxPointsFromProps,
    onPointsChange(newPoints) {
      props.onPointsChange(newPoints, pointsManager.state.maxPoints);
    },
    onMaxPointsChange(newMaxPoints) {
      props.onPointsChange(pointsManager.state.points, newMaxPoints);
    },
  });

  const textColor = useTextColors(theme.palette.background.default);
  const lightBackground = useLightBackground();
  const playedDuringTurnColor = props.player.playedDuringTurn
    ? theme.palette.primary.main
    : textColor.disabled;

  const name =
    props.player?.character?.name ||
    props.player?.playerName ||
    t("play-route.character-name");

  const hasCharacterSheet = !!props.player.character;

  const points = parseInt(mainPointerBlock?.value ?? "0") || 0;

  const pointsStyle = css({
    background: points === 0 ? textColor.disabled : theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transition: theme.transitions.create("background"),
    width: "2rem",
    height: "2rem",
    margin: "0 auto",
  });

  const handleRoll = (options: IRollDiceOptions) => {
    props.onDiceRoll(options);
    logger.info("ScenePlayer:onDiceRoll");
  };

  return (
    <>
      <Box bgcolor={props.highlight ? lightBackground : undefined}>
        <Box py=".8rem" px=".5rem">
          <Grid container spacing={2} wrap="nowrap">
            <Grid item xs={9}>
              {renderCharacterSheetButton()}
            </Grid>
            <Grid item xs className={css({ textAlign: "right" })}>
              {renderInitiative()}
            </Grid>
          </Grid>
          {/* TODO update show result even if highlight... */}
          {!props.highlight && (
            <Grid container spacing={2} wrap="nowrap">
              <Grid item>{renderDiceBox()}</Grid>
            </Grid>
          )}
          <Grid container spacing={2} wrap="nowrap">
            <Grid item>{renderPointCounter()}</Grid>
          </Grid>
          {!props.readonly && !props.player.isGM && (
            <Grid container spacing={2} wrap="nowrap">
              <Grid item>{renderCharacterActions()}</Grid>
            </Grid>
          )}
          {props.renderControls && !props.player.isGM && (
            <Grid container spacing={2} wrap="nowrap">
              <Grid item>{renderGMActions()}</Grid>
            </Grid>
          )}
        </Box>
        <Divider light />
      </Box>
    </>
  );

  function renderGMActions() {
    return (
      <Box>
        <Tooltip title={t("player-row.remove-character")}>
          <IconButton
            data-cy={`${props["data-cy"]}.remove`}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              props.onPlayerRemove();
              logger.info("ScenePlayer:onPlayerRemove");
            }}
          >
            <HighlightOffIcon
              color="error"
              className={css({ width: "1rem", height: "1rem" })}
            />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  function renderCharacterActions() {
    return (
      <>
        <Box px=".25rem">
          <Link
            component="button"
            variant="caption"
            className={css({
              color: theme.palette.primary.main,
            })}
            onClick={() => {
              props.onLoadCharacterSheet();
              logger.info("ScenePlayer:onCharacterSheetContextButtonPress");
            }}
          >
            {hasCharacterSheet
              ? t("player-row.swap-character-sheet")
              : t("play-route.add-character-sheet")}
          </Link>
        </Box>
      </>
    );
  }

  function renderPointCounter() {
    return (
      <Grid
        container
        justify="center"
        alignItems="center"
        spacing={1}
        wrap="nowrap"
      >
        {!props.readonly && (
          <Grid item>
            <IconButton
              size="small"
              onClick={() => {
                pointsManager.actions.decrement();
              }}
            >
              <RemoveCircleOutlineOutlinedIcon
                className={css({ width: "1rem", height: "1rem" })}
              />
            </IconButton>
          </Grid>
        )}
        <Grid item>
          <CharacterCircleBox fontSize="1rem" minWidth="4rem">
            <ContentEditable
              data-cy={`player-row.points`}
              value={pointsManager.state.points}
              border={!props.readonly}
              readonly={props.readonly}
              onChange={(newValue, e) => {
                pointsManager.actions.setPoints(newValue);
              }}
            />
          </CharacterCircleBox>
        </Grid>
        {pointsManager.state.maxPoints !== undefined && (
          <>
            <Grid item>
              <Typography
                className={css({
                  fontSize: "2rem",
                  color: "#bdbdbd",
                  lineHeight: Font.lineHeight(2),
                })}
              >
                {"/"}
              </Typography>
            </Grid>
            <Grid item>
              <CharacterCircleBox fontSize="1rem" minWidth="4rem">
                <ContentEditable
                  data-cy={`player-row.max-points`}
                  value={pointsManager.state.maxPoints ?? ""}
                  border
                  readonly={props.readonly}
                  onChange={(newMax, e) => {
                    pointsManager.actions.setMaxPoints(newMax);
                  }}
                />
              </CharacterCircleBox>
            </Grid>
          </>
        )}
        {!props.readonly && (
          <Grid item>
            <IconButton
              size="small"
              onClick={() => {
                pointsManager.actions.increment();
              }}
            >
              <AddCircleOutlineOutlinedIcon
                className={css({ width: "1rem", height: "1rem" })}
              />
            </IconButton>
          </Grid>
        )}
      </Grid>
    );
  }

  function renderDiceBox() {
    return (
      <Grid container spacing={2} wrap="nowrap">
        <Grid item>
          <Box display="flex" justifyContent="flex-end">
            <DiceBox
              rolls={props.player.rolls}
              size="2rem"
              fontSize="1rem"
              borderSize=".15rem"
              disabled={props.readonly}
              onClick={() => {
                handleRoll({ pool: false });
              }}
            />
          </Box>
        </Grid>
        <Grid item container>
          <Grid item xs={12}>
            <DiceBonusLabel rolls={props.player.rolls} />
          </Grid>
          <Grid item xs={12}>
            <DiceBoxResult rolls={props.player.rolls} />
          </Grid>
        </Grid>
      </Grid>
    );
  }

  function renderInitiative() {
    return (
      <Tooltip
        title={
          props.player.playedDuringTurn
            ? t("player-row.played")
            : t("player-row.not-played")
        }
      >
        <span>
          <IconButton
            data-cy={`${props["data-cy"]}.toggle-initiative`}
            onClick={(e) => {
              e.stopPropagation();
              props.onPlayedInTurnOrderChange(!props.player.playedDuringTurn);
              logger.info("ScenePlayer:onPlayedInTurnOrderChange", {
                playedDuringTurn: !props.player.playedDuringTurn,
              });
            }}
            disabled={props.readonly}
            className={css({ padding: "0" })}
          >
            {props.player.playedDuringTurn ? (
              <DirectionsRunIcon htmlColor={playedDuringTurnColor} />
            ) : (
              <EmojiPeopleIcon htmlColor={playedDuringTurnColor} />
            )}
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  function renderCharacterSheetButton() {
    return (
      <>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item xs zeroMinWidth>
            <ConditionalWrapper
              condition={hasCharacterSheet}
              wrapper={(children) => (
                <Button
                  className={css({
                    width: "100%",
                    background: "transparent",
                    textTransform: "none",
                    color: theme.palette.text.primary,
                    border: "none",
                    borderRadius: "4px",
                  })}
                  data-cy={`${props["data-cy"]}.open-character-sheet`}
                  disabled={!props.player.character}
                  size="small"
                  onClick={(e) => {
                    props.onCharacterSheetOpen();
                    logger.info("ScenePlayer:onCharacterSheetButtonPress");
                  }}
                >
                  {children}
                </Button>
              )}
            >
              <Typography
                noWrap
                color="inherit"
                className={css({
                  color: theme.palette.text.primary,
                  width: "100%",
                  textAlign: "left",
                  fontSize: "1rem",
                  lineHeight: Font.lineHeight(0.8),
                  fontWeight: props.highlight ? "bold" : "normal",
                })}
              >
                {name}
              </Typography>
            </ConditionalWrapper>
          </Grid>
        </Grid>
      </>
    );
  }
};
PlayerRow.displayName = "PlayerRow";
