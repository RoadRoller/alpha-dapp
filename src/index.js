import { Col, Layout, Row } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom';
import CellCounterService from './components/service/cell_counter'

class App extends React.Component {

  render() {

    return (
      <div>
        <Layout style={{ minHeight: '100vh' }} >
          <Layout.Header style={{ background: 'rgb(35, 13, 58)', color: 'white', fontSize: '20px', textAlign: 'center' }}>
            Cell counter service
          </Layout.Header>
          <Layout.Content>
            <Row type="flex" justify="center" style={{ marginTop: '40px' }}>
              <Col xs={24} sm={24} md={22} lg={15} xl={18} span={9}>
                <CellCounterService></CellCounterService>
              </Col>
            </Row>
          </Layout.Content>
        </Layout>
      </div>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('react-root')
);
