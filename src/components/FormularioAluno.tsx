import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import axios from "axios";

interface Responsavel {
  nome: string;
  grauParentesco: string;
}

const FormularioAluno: React.FC = () => {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    transporteEscolar: "",
    turmasEnum: "",
    adultosResponsaveis: [{ nome: "", grauParentesco: "" }] as Responsavel[],
  });

  const [formEnviado, setFormEnviado] = useState(false);

  const [nomeErro, setNomeErro] = useState("");

  const verificarNomeDisponivel = async (nome: string) => {
    if (!nome.trim()) return;
    try {
      const response = await axios.get('https://controledeturmas-production.up.railway.app/alunos/check-nome', {
        params: { nome },
      });
      if (response.data) {
        setNomeErro("O aluno já está cadastrado no Sistema, para mudar algo, acione a coordenação");
      } else {
        setNomeErro("");
      }
    } catch (error) {
      console.error("Erro ao verificar o nome:", error);
      setNomeErro("Erro ao verificar o nome. Tente novamente.");
    }
  }; 

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResponsavelChange = (
    index: number,
    field: keyof Responsavel,
    value: string
  ) => {
    setForm((prev) => {
      const updatedResponsaveis = [...prev.adultosResponsaveis];
      updatedResponsaveis[index][field] = value;
      return { ...prev, adultosResponsaveis: updatedResponsaveis };
    });
  };

  const addResponsavel = () => {
    setForm((prev) => ({
      ...prev,
      adultosResponsaveis: [
        ...prev.adultosResponsaveis,
        { nome: "", grauParentesco: "" },
      ],
    }));
  };

  const removeResponsavel = (index: number) => {
    setForm((prev) => {
      const updatedResponsaveis = prev.adultosResponsaveis.filter(
        (_, i) => i !== index
      );
      return { ...prev, adultosResponsaveis: updatedResponsaveis };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nomeErro) {
      alert("Corrija os erros antes de enviar o formulário.");
      return;
    }

    const payload = {
      nome: form.nome,
      telefone: form.telefone,
      transporteEscolar: form.transporteEscolar,
      turmasEnum: form.turmasEnum,
      adultosResponsaveis: form.adultosResponsaveis.map((responsavel) => ({
        nome: responsavel.nome,
        grauParentesco: responsavel.grauParentesco,
      })),
    };

    console.log("JSON enviado:", JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post(
        'https://controledeturmas-production.up.railway.app/alunos',
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Resposta do servidor:", response.data);
      alert("Aluno cadastrado com sucesso!");
      setFormEnviado(true);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      alert("Erro ao cadastrar aluno. Confira os campos e tente novamente.");
    }
  };

  if (formEnviado) {
    return (
      <Container className="mt-5 text-center">
        <h1 style={{ color: "#007BFF", fontWeight: "bold" }}>
          Formulário Enviado Com Sucesso, Obrigado!
        </h1>
        <img
          src="/ImagemFinal.webp"
          alt="Sucesso"
          style={{ maxWidth: "400px", marginTop: "20px" }}
        />
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col className="d-flex align-items-center">
          <img
            src="/LogoSchool.png"
            alt="Logo"
            style={{ height: "65px", marginRight: "20px" }}
          />
          <h1 style={{ color: "#007BFF", fontWeight: "bold", marginLeft: "2.5rem"}}>
            Cadastro de Aluno
          </h1>
        </Col>
      </Row>

      <Card className="p-4 shadow" style={{ width: "40rem" }}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4" controlId="formNome">
            <Form.Label>
              <strong>Nome da Criança</strong>
            </Form.Label>
            <Form.Control
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              onBlur={(e) => verificarNomeDisponivel(e.target.value)}
              placeholder="Digite o nome completo"
              required
            />
            {nomeErro && <div style={{ color: "red", marginTop: "5px" }}>{nomeErro}</div>}
          </Form.Group>

          <Form.Group className="mb-4" controlId="formTelefone">
            <Form.Label>
              <strong>Telefone do Responsável</strong>
            </Form.Label>
            <Form.Control
              type="text"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              placeholder="Digite o telefone atualizado do Responsável"
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formTransporte">
            <Form.Label>
              <strong>Transporte Escolar (Caso Tenha)</strong>
            </Form.Label>
            <Form.Control
              as="textarea"
              name="transporteEscolar"
              value={form.transporteEscolar}
              onChange={handleChange}
              placeholder="Caso a Criança esteja autorizada a ser retirada da escola pelo Transporte Escolar, escreva o Nome do Transportador"
              rows={3}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formTurma">
            <Form.Label>
              <strong>Turma da Criança</strong>
            </Form.Label>
            <Form.Select
              name="turmasEnum"
              value={form.turmasEnum}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              <option value="TURMA_1A">Turma 1A</option>
              <option value="TURMA_1B">Turma 1B</option>
              <option value="TURMA_1C">Turma 1C</option>
              <option value="TURMA_2A">Turma 2A</option>
              <option value="TURMA_2B">Turma 2B</option>
              <option value="TURMA_2C">Turma 2C</option>
              <option value="TURMA_2D">Turma 2D</option>
              <option value="TURMA_3A">Turma 3A</option>
              <option value="TURMA_3B">Turma 3B</option>
              <option value="TURMA_3C">Turma 3C</option>
              <option value="TURMA_4A">Turma 4A</option>
              <option value="TURMA_4B">Turma 4B</option>
              <option value="TURMA_4C">Turma 4C</option>
              <option value="TURMA_5A">Turma 5A</option>
              <option value="TURMA_5B">Turma 5B</option>
              <option value="TURMA_5C">Turma 5C</option>
              <option value="TURMA_6A">Turma 6A</option>
              <option value="TURMA_6B">Turma 6B</option>
              <option value="TURMA_6C">Turma 6C</option>
              <option value="TURMA_7A">Turma 7A</option>
              <option value="TURMA_7B">Turma 7B</option>
              <option value="TURMA_7C">Turma 7C</option>
              <option value="TURMA_8A">Turma 8A</option>
              <option value="TURMA_8B">Turma 8B</option>
              <option value="TURMA_8C">Turma 8C</option>
              <option value="TURMA_9A">Turma 9A</option>
              <option value="TURMA_9B">Turma 9B</option>
              <option value="TURMA_9C">Turma 9C</option>
            </Form.Select>
          </Form.Group>

          <h2 style={{ color: "#007BFF", marginTop: "20px" }}>Responsáveis</h2>
          <p><strong> A criança está autorizada a ir embora da escola com os seguintes adultos: (mesmo que a criança seja retirada por Transporte escolar, preencher nomes dos adultos que podem retira-la em caso de emergência ou ausência do Transporte Escolar)!</strong></p>
          {form.adultosResponsaveis.map((responsavel, index) => (
            <Card className="p-3 mb-3" key={index}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId={`responsavelNome-${index}`}>
                    <Form.Label>
                      <strong>Nome</strong>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={responsavel.nome}
                      onChange={(e) =>
                        handleResponsavelChange(index, "nome", e.target.value)
                      }
                      placeholder="Nome do responsável"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId={`responsavelParentesco-${index}`}>
                    <Form.Label>
                      <strong>Parentesco</strong>
                    </Form.Label>
                    <Form.Select
                      value={responsavel.grauParentesco}
                      onChange={(e) =>
                        handleResponsavelChange(
                          index,
                          "grauParentesco",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Selecione</option>
                      <option value="Pai">Pai</option>
                      <option value="Mae">Mãe</option>
                      <option value="Avo">Avó/Avô</option>
                      <option value="Irmao">Irmão</option>
                      <option value="Irma">Irmã</option>
                      <option value="Tios">Tio/Tia</option>
                      <option value="Primos">Primo/Prima</option>
                      <option value="TransporteEscolar">Transporte Escolar</option>
                      <option value="Outro">Outro</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button
                    variant="danger"
                    onClick={() => removeResponsavel(index)}
                    className="w-100 d-flex justify-content-center align-items-center"
                  >
                    <FaTrash />
                  </Button>
                </Col>
              </Row>
            </Card>
          ))}

          <Button
            variant="success"
            onClick={addResponsavel}
            className="w-100 mb-4"
          >
            Adicionar mais um Responsável
          </Button>

          <Button type="submit" variant="primary" className="w-100">
            Enviar Formulário
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default FormularioAluno;
