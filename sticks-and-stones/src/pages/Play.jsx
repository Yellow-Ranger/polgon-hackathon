import React, { useEffect, useState } from "react";
import useImportScript from "../utils/useImportScript.jsx";
import { Helmet } from "react-helmet";
import Game from "../game/main.js";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import "../styles/play.css";
import Stack from "react-bootstrap/Stack";
import { toast } from "react-toastify";

function Play() {
  //useImportScript("../game/main.js");
  const [betAmount, setBetAmount] = useState();

  const onChange = (e) => {
    setBetAmount((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    toast.success(`You bet $${betAmount["formBetAmount"]}`);
  };

  return (
    <>
      <div className="text-center title">Sticks and Stones - Tourney</div>
      <div className="d-flex align-items-center justify-content-center form">
        <form onSubmit={onSubmit} className="text-center">
          <Stack>
            <div className="card">
              <Form.Group
                className="mb-3"
                style={{ padding: "2em" }}
                controlId="formBetAmount"
              >
                <Form.Label>Bet Amount: </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  onChange={onChange}
                />
                <Form.Text className="text-muted">
                  Funds will be temporarily held until match is over
                </Form.Text>
              </Form.Group>
            </div>
          </Stack>
        </form>
      </div>
    </>
  );
}

export default Play;
