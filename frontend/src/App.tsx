import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Paper, Grid, Button, Typography, CircularProgress } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { backend } from 'declarations/backend';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff',
    },
    secondary: {
      main: '#6c757d',
    },
  },
});

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    backend.clear();
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      performCalculation(operator, inputValue);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const performCalculation = async (op: string, secondOperand: number) => {
    if (firstOperand === null) return;

    setLoading(true);
    try {
      const result = await backend.calculate(firstOperand, secondOperand, op);
      if (result !== null) {
        setDisplay(result.toString());
        setFirstOperand(result);
      } else {
        setDisplay('Error');
      }
    } catch (error) {
      console.error('Calculation error:', error);
      setDisplay('Error');
    } finally {
      setLoading(false);
    }
    setOperator(null);
  };

  const handleEquals = () => {
    if (!operator || firstOperand === null) return;
    const secondOperand = parseFloat(display);
    performCalculation(operator, secondOperand);
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+'
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Paper elevation={3} style={{ padding: '1rem', marginTop: '2rem' }}>
          <Typography variant="h4" gutterBottom>
            IC Calculator
          </Typography>
          <Paper variant="outlined" style={{ padding: '1rem', marginBottom: '1rem', position: 'relative' }}>
            <Typography variant="h3" align="right">
              {display}
            </Typography>
            {loading && (
              <CircularProgress
                size={24}
                style={{ position: 'absolute', top: '50%', left: '1rem', marginTop: '-12px' }}
              />
            )}
          </Paper>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Button fullWidth variant="contained" color="secondary" onClick={clear}>
                <BackspaceIcon />
              </Button>
            </Grid>
            {buttons.map((btn) => (
              <Grid item xs={3} key={btn}>
                <Button
                  fullWidth
                  variant="contained"
                  color={['/', '*', '-', '+', '='].includes(btn) ? 'primary' : 'secondary'}
                  onClick={() => {
                    if (btn === '=') handleEquals();
                    else if (['+', '-', '*', '/'].includes(btn)) handleOperator(btn);
                    else if (btn === '.') inputDecimal();
                    else inputDigit(btn);
                  }}
                  disabled={loading}
                >
                  {btn}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default App;
