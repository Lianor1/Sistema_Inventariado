import React, { useState } from 'react';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { FaRobot, FaPaperPlane } from 'react-icons/fa';

const AIAssistantButton = () => {
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const newMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate AI response
    let aiResponse = 'Lo siento, no puedo responder a esa pregunta en este momento.';
    if (input.toLowerCase().includes('stock') && input.toLowerCase().includes('agotarse')) {
      aiResponse = 'Tienes menos de 5 unidades de Audífonos X200. Te recomendamos pedir al menos 10.';
    } else if (input.toLowerCase().includes('mejor vendedor')) {
      aiResponse = 'Tu producto más vendido esta semana fue la Funda Resistente.';
    } else if (input.toLowerCase().includes('pedir esta semana')) {
      aiResponse = 'Basado en el bajo stock, deberías considerar pedir Audífonos X200 y Teclado Mecánico.';
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 1000);

    setInput('');
  };

  return (
    <>
      <Button
        variant="primary"
        className="rounded-circle shadow-lg"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
        onClick={handleShow}
      >
        <FaRobot />
      </Button>

      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Asistente IA</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          <div className="flex-grow-1 overflow-auto mb-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex mb-2 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`p-2 rounded ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-light text-dark border'}`}
                  style={{ maxWidth: '80%' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <Form onSubmit={handleSendMessage}>
            <Form.Group className="d-flex">
              <Form.Control
                type="text"
                placeholder="Escribe tu pregunta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="me-2"
              />
              <Button variant="primary" type="submit">
                <FaPaperPlane />
              </Button>
            </Form.Group>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AIAssistantButton;
