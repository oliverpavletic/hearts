import React, { Component } from 'react';
import styled from 'styled-components';
import OutsideClickHandler from 'react-outside-click-handler';

import { Table } from 'react-bootstrap';
import { ScorecardData } from '../types/scorecardData';
import { COLOR_LIGHTEST_GREY } from '../colors';

const Wrapper = styled.div`
  position: absolute;
  width: 550px;
  height: 300px;
  left: 50%;
  top: 5%;
  transform: translate(-50%, 0%);
  background: whitesmoke;
  border: 5px solid ${COLOR_LIGHTEST_GREY};
  border-radius: 0.2em;
  overflow: hidden;
  box-sizing: border-box;
`;

const Scroller = styled.div`
  height: 100%;
  overflow: scroll;
  overflow-y: scroll;
  /* Hide scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  -webkit-scrollbar {
    /* WebKit */
    width: 0;
    height: 0;
  }
`;

const TableStyle = `
  .table {
    width: 100%;
    height: 100%;
    font-family: 'Baloo Tamma 2', cursive;
    margin-bottom: 0px;
  }

  th.round {
    width: 12%;
  }

  th.player {
    width: 22%;
  }

  td, th {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

type ScorecardProps = {
  scorecardData: ScorecardData | null;
  handleOutsideClick: () => void;
};

class Scorecard extends Component<ScorecardProps, {}> {
  render() {
    const { scorecardData, handleOutsideClick } = this.props;

    return (
      <OutsideClickHandler onOutsideClick={handleOutsideClick}>
        <Wrapper>
          <Scroller>
            <style type="text/css">{TableStyle}</style>
            <Table striped bordered>
              {scorecardData !== null && (
                <>
                  <thead>
                    <tr>
                      <th className="round">Round</th>
                      {scorecardData.header.playerNames.map((name) => (
                        <th className="player">{name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scorecardData.rounds.map((round) => {
                      return (
                        <tr>
                          <td>{round.roundNum}</td>
                          {round.scores.map((score) => (
                            <td>{score}</td>
                          ))}
                        </tr>
                      );
                    })}
                    {
                      <tr>
                        <td>Total</td>
                        {scorecardData.totals.map((total) => (
                          <td>{total}</td>
                        ))}
                      </tr>
                    }
                  </tbody>
                </>
              )}
              {scorecardData === null && (
                <thead>
                  <tr>
                    <th className="round">No</th>
                    <th className="player">Score</th>
                    <th className="player">Data</th>
                    <th className="player">Yet</th>
                    <th className="player">:-(</th>
                  </tr>
                </thead>
              )}
            </Table>
          </Scroller>
        </Wrapper>
      </OutsideClickHandler>
    );
  }
}

export default Scorecard;
