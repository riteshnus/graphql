import React, { Component } from 'react';
import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import './Events.css';
import AuthContext from '../context/auth-context';
import EventList from '../components/Events/EventList/EventList';
import Spinner from '../components/Spinner/Spinner';

class EventPage extends Component {
  state = {
    creating: false,
    events: [],
    isLoading: false,
    selectedEvent: null
  };

  isActive = true;

  static contextType = AuthContext

  constructor(props) {
    super(props);
    this.titleRef = React.createRef();
    this.priceRef = React.createRef();
    this.dateRef = React.createRef();
    this.descriptionRef = React.createRef();
  }

  componentDidMount() {
    this.fetchEvents();
  }

  createEventHandler = () => {
    this.setState({creating: true});
  }

  modalConfirmHandler = () => {
    this.setState({creating: false});
    const title = this.titleRef.current.value;
    const price = +this.priceRef.current.value;
    const date = this.dateRef.current.value;
    const description = this.descriptionRef.current.value;

    if (
      title.trim().length === 0 || 
      price <= 0 || 
      date.trim().length === 0 || 
      description.trim().length === 0 
    ) {
      return;
    }
    const event = { title, price, date, description }
    console.log(event);

    const requestBody = {
      query: `
          mutation CreateEvent($title: String!, $description: String!, $price: Float!, $date: String!){
            createEvents(eventInput: {title: $title, description: $description, price: $price, date: $date}) {
              _id
              title
              description
              date
              price
            }
          }
        `, variables: {
          title: title,
          description: description,
          price: price,
          date: date
        }
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.context.token}`
      }
    })
    .then(res => {
      if(res.status !== 200 && res.status !== 201) {
        throw new Error('Failed');
      }
      return res.json();
    }).then(resData => {
      console.log(resData)
      this.setState(prevState => {
        const updateEvents = [...prevState.events];
        updateEvents.push({
          _id: this.context.userId,
          title: resData.data.createEvents.title,
          description: resData.data.createEvents.description,
          price: resData.data.createEvents.price,
          date: resData.data.createEvents.date,
          creator: {
            _id: this.context.userId
          }
        })
        return {events: updateEvents};
      })
      // this.fetchEvents();
    }).catch(err => {
      console.log(err);
    })
  }

  modalCancelHandler = () => {
    this.setState({creating: false, selectedEvent: null});
  }

  showDetailHandler = (eventId) => {
    this.setState(prevState => {
      const selectedEvent = prevState.events.find(e => e._id === eventId)
      return {selectedEvent: selectedEvent}
    })
  }

  bookEventHandler = () => {
    if(!this.context.token) {
      this.setState({selectedEvent: null})
      return;
    }
    const requestBody = {
      query: `
        mutation BookEvent($id: ID!){
          bookEvent(eventId: $id) {
            _id,
            createdAt,
            updatedAt
          }
        }
      `, variables : {
        id: this.state.selectedEvent._id
      }
    }

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.context.token}`
      }
    })
    .then(res => {
      if(res.status !== 200 && res.status !== 201) {
        throw new Error('Failed');
      }
      return res.json();
    }).then(resData => {
      console.log(resData)
      this.setState({selectedEvent: null})
    }).catch(err => {
      console.log(err);
    })
  }

  fetchEvents = () => {
    this.setState({isLoading: true})
    let requestBody = {
      query: `
        query {
          events {
            _id
            title
            description
            date
            price
            creator {
              _id
              email
            }
          }
        }
      `
    }

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if(res.status !== 200 && res.status !== 201) {
        throw new Error('Failed');
      }
      return res.json();
    }).then(resData => {
      console.log(resData)
      const events = resData.data.events;
      if(this.isActive){
        this.setState({events: events, isLoading: false})
      }
    }).catch(err => {
      console.log(err);
      this.setState({isLoading: false})
    })
  }

  componentWillUnmount() {
    this.isActive = false;
  }

  render() {
    return (
      <React.Fragment>
        { (this.state.creating || this.state.selectedEvent) && <Backdrop /> }
        { this.state.creating && 
          <Modal 
            title="Add Event" 
            canCancel 
            canConfirm 
            onCancel={this.modalCancelHandler} 
            onConfirm={this.modalConfirmHandler}
            confirmText="Confirm"
          >
            <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" ref={this.titleRef} />
              </div>
              <div className="form-control">
                <label htmlFor="price">Price</label>
                <input type="number" id="price" ref={this.priceRef}/>
              </div>
              <div className="form-control">
                <label htmlFor="date">Date</label>
                <input type="datetime-local" id="date" ref={this.dateRef}/>
              </div>
              <div className="form-control">
                <label htmlFor="description">Description</label>
                <textarea id="description" rows="4" ref={this.descriptionRef}/>
              </div>
            </form>
          </Modal> }
          {this.state.selectedEvent &&
          <Modal 
            title={this.state.selectedEvent.title} 
            canCancel 
            canConfirm 
            onCancel={this.modalCancelHandler} 
            onConfirm={this.bookEventHandler}
            confirmText={this.context.token ? "Book" : "Confirm" }
          >
            <h1>{this.state.selectedEvent.title}</h1>
            <h2>${this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleDateString()}</h2>
            <p>{this.state.selectedEvent.description}</p>
          </Modal> }
          {this.context.token && <div className="events-control">
            <p>Share your own Events!</p>
            <button className="btn" onClick={this.createEventHandler}>Create Event</button>
          </div> }
          {this.state.isLoading ? 
            <Spinner /> : 
            <EventList 
              events={this.state.events} 
              authUserId={this.context.userId}
              onViewDetail={this.showDetailHandler}>
            </EventList> }
      </React.Fragment>
    )
  }
}

export default EventPage;