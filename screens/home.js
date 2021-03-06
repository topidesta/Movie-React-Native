import React, { Component } from 'react';
import { View, Text, ConnectionType, NetInfo, ScrollView, Dimensions, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, } from 'react-native';
import IconM from 'react-native-vector-icons/MaterialIcons';
import { Navigation } from 'react-native-navigation';
import { goDetail, hideTopBar, openDrawer, goSearch } from '../routes/routes';
import TopBar from '../components/topbar'
import { fetchData } from '../store/actions/home/homeAction';
import { connect } from 'react-redux';
import { primaryColor, commomStyle, baseImgPth } from '../utils/constant'
import Banner, { IndicaterAlign, IndicaterType } from 'react-native-whc-banner'
import MovieList from '../components/movieList';
import ApiService from '../network/apiService';
import Loading from '../components/loading';
import ErrorView from '../components/errorView';


class Home extends React.PureComponent {

    _isMounted = false

    apiRequest() {
        ApiService.get('movie/popular')
            .then(response => {
                if (this._isMounted) {
                    this.setState({
                        popularList: response.results,
                    })
                }
                ApiService.get('movie/top_rated')
                    .then(response => {
                        if (this._isMounted) {
                            this.setState({
                                lastestList: response.results,
                            })
                        }

                        ApiService.get('movie/upcoming')
                            .then(response => {
                                if (this._isMounted) {
                                    this.setState({
                                        isLoading: false,
                                        isError: false,
                                        bannerList: response.results,
                                    })
                                }
                            }).catch(error => {
                                if (this._isMounted) {

                                    this.setState({
                                        isError: true,
                                        errorMessage: error
                                    })
                                }
                            })
                    }).catch(error => {
                        if (this._isMounted) {
                            this.setState({
                                isError: true,
                                errorMessage: error
                            })
                        }
                    })
            }).catch(error => {
                if (this._isMounted) {
                    this.setState({
                        isLoading: false,
                        isError: true,
                        errorMessage: error
                    })
                }
            })
    }



    componentWillUnmount() {
        this._isMounted = false

    }

    componentDidMount(){
        this._isMounted = true
        hideTopBar(this.props.componentId)
        NetInfo.isConnected.fetch().then(isConnected => {
            isConnected ? this.apiRequest() :
                (this._isMounted) ?
                    this.setState({
                        isError: true,
                        isLoading: false,
                        errorMessage: "No internet connection"
                    }) : null
        })
        // Navigation.mergeOptions(this.props.componentId,{
        //     sideMenu : {
        //         left : {
        //             visible : false
        //         }
        //     }
        // });
    }

    constructor(props) {
        super(props)
        Navigation.events().bindComponent(this);
        this.state = {
            isLoading: true,
            isError: false,
            popularList: [],
            lastestList: [],
            bannerList: [],
            errorMessage: ''
        }
    }

    goDetail = (data) => {
        goDetail(this.props.componentId, data)
    }
    goSearch = () => {
        goSearch(this.props.componentId)
    }
    render() {
       
        return (
            <View style={{ backgroundColor: 'white',flex:1 }}>

                <SafeAreaView style={{
                    backgroundColor: primaryColor,
                    flexDirection: 'column'
                }}>
                    <View style={{flexDirection :'column',height :"100%"}}>
                    <TopBar title='Home'  componentId ={this.props.componentId}/>
                    {this.state.isLoading ?
                        <Loading /> :
                        this.state.isError ?
                            <ErrorView errorMessage={this.state.errorMessage} /> :
                            <ScrollView style={styles.container}>
                                <View style={styles.bannerContent} >
                                    <Banner autoLoop={true} style={styles.banner}>
                                        {this.state.bannerList.slice(0, 5).map((item, index) => {
                                            return (
                                                <TouchableOpacity onPress={() => this.goDetail(item)}>
                                                    <View
                                                        key={item.id.toString() + Math.random().toString() + item.title + index}
                                                        style={{ width: Dimensions.get('screen').width }}>
                                                        <Navigation.Element elementId={item.id.toString()}
                                                            style={{ width: "100%", height: '100%', flex: 0 }}
                                                            elementId={item.id.toString()}>
                                                            <Image style={{ width: "100%", height: '100%', flex: 0 }}
                                                                source={{
                                                                    uri:
                                                                        baseImgPth + item.backdrop_path
                                                                }} />
                                                        </Navigation.Element>

                                                    </View>
                                                </TouchableOpacity>

                                            )
                                        })}
                                    </Banner>
                                </View>
                                <View style={styles.popular}>
                                    <Text style={{ padding: 8, fontSize: 16, color: 'black', fontWeight: 'bold' }}>
                                        Popular Movies
                                 </Text>
                                    <MovieList clickItem={(data) => this.goDetail(data)} listData={this.state.popularList} />
                                </View>
                                <View style={styles.latest}>
                                    <Text style={{ padding: 8, fontSize: 16, color: 'black', fontWeight: 'bold' }}>
                                        Top Rated Movies
                        </Text>
                                    <MovieList clickItem={(data) => this.goDetail(data)} listData={this.state.lastestList} />
                                </View>
                            </ScrollView>}
                            </View>
                </SafeAreaView>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    banner: {
        width: "100%",
        aspectRatio: 1.5,
        backgroundColor: "black"
    },

    bannerContent: {
        flex: 0,
        width: "100%",
    },

    popular: {
        width: "100%",
        flexDirection: 'column',
        aspectRatio: 1.6,
        backgroundColor: "white"
    },
    latest: {
        width: "100%",
        flexDirection: 'column',
        aspectRatio: 1.6,
        backgroundColor: "white"
    },

    image: {
        margin: 8,
        flex: 1,
        width: "30%",
        backgroundColor: 'white'
    }
})


const mapStateToProps = (state) => {
    return {
        data: state.homeReducer.data
    }
}



const mapDispatchToProps = dispatch => {
    return {
        fetch: (value) => {
            dispatch(fetchData(value))
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);