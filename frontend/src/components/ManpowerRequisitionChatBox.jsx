import React, { useState, useEffect, useRef, use } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { FaCommentDots } from 'react-icons/fa';
import "./Add_Form.css";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
    Button,
    Box,
    Typography,
    Paper,
    Avatar,
    IconButton,
    Badge,
    Tooltip,
    TextField,
    Divider,
    Backdrop,
    CircularProgress,
} from "@mui/material";
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    EmojiEmotions as EmojiIcon,
    MoreVert as MoreVertIcon,
    Check as CheckIcon,
    DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatMessageList, sentChatboxMessage } from '../redux/cases/manpowerrequisitionChatSlice';
import io from 'socket.io-client';
import { fetchManpowerRequisitionById, fetchQuery, replyToQuery } from '../redux/cases/manpowerrequisitionSlice';
// ==================== STYLED COMPONENTS ====================

const ChatContainer = styled(Paper)(({ theme }) => ({
    height: '700px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(3),
}));

const ChatHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2.5),
    backgroundColor: theme.palette.primary.dark,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: '8px 8px 0 0',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    '&::-webkit-scrollbar': {
        width: '6px',
    },
    '&::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.primary.light,
        borderRadius: '10px',
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
        },
    },
}));

const MessageBubble = styled(motion.div)(({ theme, ismine }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    maxWidth: '85%',
    backgroundColor: ismine === 'true' ? theme.palette.primary.main : theme.palette.grey[200],
    color: ismine === 'true' ? 'white' : theme.palette.text.primary,
    borderRadius: '16px 16px 16px 0px',
    marginLeft: ismine === 'true' ? 'auto' : 0,
    marginRight: ismine === 'true' ? 0 : 'auto',
    boxShadow: ismine === 'true' ? theme.shadows[3] : theme.shadows[1],
    transition: 'all 0.3s ease',
    cursor: 'default',
    '&:hover': {
        transform: 'scale(1.01)',
    },
    ...(ismine === 'true' && {
        borderBottomRightRadius: '0px',
    }),
    ...(ismine === 'false' && {
        borderBottomLeftRadius: '0px',
    })
}));

const InputContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: 'white',
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        backgroundColor: '#f5f5f5',
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: '#ebebeb',
        },
        '&.Mui-focused': {
            backgroundColor: 'white',
            boxShadow: `0 0 0 3px ${theme.palette.primary.main}15`,
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
                borderWidth: '2px',
            }
        }
    }
}));

const TypingIndicator = styled(motion.div)(({ theme }) => ({
    display: 'flex',
    gap: '6px',
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.grey[200],
    borderRadius: '16px 16px 16px 0px',
    alignSelf: 'flex-start',
    maxWidth: '70px',
    marginBottom: theme.spacing(2),
}));

const TypingDot = styled(motion.span)(({ theme }) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
}));

const OnlineBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

// ==================== MAIN COMPONENT ====================

const ManpowerRequisitionChatBox = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const location = useLocation();
    const { id } = useParams();
    const { token, user, status } = useSelector((state) => state.auth);
    const currentUser = user;
    const [errors, setErrors] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showReplyButton, setShowReplyButton] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


    useEffect(() => {
        if (status === 'idle' || status === 'succeeded' && user) {
            dispatch(fetchChatMessageList(id));
            dispatch(fetchManpowerRequisitionById(id));
            dispatch(fetchQuery(id));
        }
        const socket = io(API_URL);
        socket.on('manpowerrequisition-query-refresh', () => {
            dispatch(fetchChatMessageList(id))
            dispatch(fetchManpowerRequisitionById(id));
            dispatch(fetchQuery(id));

        });
        return () => socket.disconnect();
    }, [user, dispatch]);


    const chatMessageList = useSelector((state) => state.manpowerRequisitionChat.data ?? []);
    const selectedRequisition = useSelector((state) => state.manpowerRequisition.selectedRequisition);
    const query = useSelector((state) => state.manpowerRequisition.query);
    
    useEffect(() => {
        console.log(!showReplyButton,"showReplyButtonshowReplyButtonshowReplyButtonshowReplyButtonshowReplyButton")
    }, [showReplyButton]);

    useEffect(() => {
        if (user && user?.emp_id == "12345") {
            setShowReplyButton(false);
        } else if (user?.emp_id == "1400") {
            setShowReplyButton(selectedRequisition?.status === 'Pending');
        } else if (user?.emp_id == "1722") {
            setShowReplyButton(selectedRequisition?.status === 'Approved');
        } else {
            setShowReplyButton(selectedRequisition?.status === 'Raise Query');
        }}
        , [user, selectedRequisition?.status])

    const [form, setForm] = useState({
        answerMessage: '',
    });


    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sortedChatMessageList = React.useMemo(() => {
        const isDirectorChat = location.pathname.includes('/Director_chatbox');
        const isHrChat = location.pathname.includes('/HR_chatbox');

        const filteredList = chatMessageList.filter(msg => {
            if (isDirectorChat) {
                return String(msg.query_created_by) === '1400';
            }
            if (isHrChat) {
                return String(msg.query_created_by) === '1722';
            }
            return false; // By default, show nothing if the URL doesn't match
        });

        const expandedList = [];

        filteredList.forEach(msg => {
            if (isDirectorChat && msg.query_name_director) {
                expandedList.push({
                    ...msg,
                    text: msg.query_name_director,
                    author_id: msg.query_created_by,
                    author_name: msg.emp_name,
                    original_pid: `${msg.query_pid}_q_dir`,
                });
                if (msg.Director_Query_Answer) {
                    expandedList.push({
                        ...msg,
                        text: msg.Director_Query_Answer,
                        author_id: selectedRequisition?.created_by,
                        author_name: selectedRequisition?.emp_name,
                        original_pid: `${msg.query_pid}_a_dir`,
                    });
                }
            } else if (isHrChat && msg.query_name_hr) {
                expandedList.push({
                    ...msg,
                    text: msg.query_name_hr,
                    author_id: msg.query_created_by,
                    author_name: msg.emp_name,
                    original_pid: `${msg.query_pid}_q_hr`,
                });
                if (msg.Hr_Query_Answer) {
                    expandedList.push({
                        ...msg,
                        text: msg.Hr_Query_Answer,
                        author_id: selectedRequisition?.created_by,
                        author_name: selectedRequisition?.emp_name,
                        original_pid: `${msg.query_pid}_a_hr`,
                    });
                }
            }
        });

        return expandedList.sort((a, b) => {
            const dateA = new Date(a.query_created_date + 'T' + a.query_created_time);
            const dateB = new Date(b.query_created_date + 'T' + b.query_created_time);
            return dateA - dateB;
        });
    }, [chatMessageList, location.pathname, user?.emp_id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [sortedChatMessageList, isTyping]);

    // Check if message is unread for current user
    const isMessageUnreadForCurrentUser = (msg) => {
        const userId = String(currentUser.emp_id);
        const senderId = String(msg.discusess_created_user_id);

        // If current user sent the message, it's considered read
        if (userId === senderId) return false;

        // Check if user ID is NOT in the discussion_read_users list
        const readUsersList = msg.discussion_read_users || "";
        return !readUsersList.split(',').includes(userId);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    

    // Handle send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!form.answerMessage || form.answerMessage.trim() === '') return;

        setIsSending(true);

        const messageData = {
            message: form.answerMessage,
            query_manpower_requisition_pid: id,
        };


        console.log({ id: user?.emp_id, reply: messageData.message, query_pid: query.query_pid })



        // await dispatch(replyToQuery({ id: id, reply: messageData.message, query_pid: query.query_pid})).unwrap();
        // setForm(prev => ({ ...prev, answerMessage: '' }));
        try {
            await dispatch(replyToQuery({ id: id, reply: messageData.message, query_pid: query.query_pid })).unwrap();
            setForm(prev => ({ ...prev, answerMessage: '' }));
        } catch (error) {
            console.error("Failed to send reply:", error);
        } finally {
            setIsSending(false);
        }
    };

    // Animation variants
    const messageVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.9
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 500,
                damping: 30
            }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            transition: { duration: 0.2 }
        }
    };

    const dotVariants = {
        start: { y: 0 },
        end: {
            y: -10,
            transition: {
                duration: 0.6,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
            }
        }
    };

    const role =
        !user?.emp_id
            ? 'FH'
            : ['1400', '1777'].includes(user.emp_id)
                ? 'DR'
                : 'HR';
    return (
        <>
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 9999 }}
            open={isSending}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
        <div className="page-wrapper">
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 9999 }}
                open={isSending}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            <div className="form-panel">
                {/* Back Button */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 5, flexDirection: "row-reverse" }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        startIcon={<ArrowBackIcon sx={{ color: 'white' }} />}
                        sx={{
                            backgroundColor: 'success.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'success.dark',
                                transform: 'translateX(-4px)',
                                transition: 'all 0.3s ease'
                            },
                        }}
                    >
                        Back
                    </Button>
                </Box>



                {/* Chat Container */}
                <ChatContainer >
                    {/* Chat Header */}
                    <ChatHeader>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <OnlineBadge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                variant="dot"
                            >
                                <Avatar
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        bgcolor: 'white',
                                        color: 'primary.dark',
                                    }}
                                >
                                    {role}
                                </Avatar>
                            </OnlineBadge>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                                    Discussion for: Manpower Requisition
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton sx={{ color: 'white' }} size="small">
                            <MoreVertIcon />
                        </IconButton>
                    </ChatHeader>

                    <Divider sx={{ mb: 2 }} />

                    {/* Messages Container */}
                    <MessagesContainer>
                        {chatMessageList && chatMessageList.length > 0 ? (
                            <AnimatePresence mode="popLayout">
                                {sortedChatMessageList.map((msg) => {
                                    const isMine = Number(msg.author_id) === Number(currentUser.emp_id);
                                    const isUnreadForMe = false; // Simplified for this logic
                                    if (!msg.text) return null;
                                    return (
                                        <MessageBubble
                                            key={msg.original_pid}
                                            ismine={isMine.toString()}
                                            variants={messageVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            {/* Sender Name (only for other users) */}
                                            {!isMine && (
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: 'primary.main'
                                                    }}
                                                >
                                                    {msg.author_name}
                                                </Typography>
                                            )}
                                            {/* Message Text */}
                                            <Box
                                                sx={{
                                                    mt: 0.5,
                                                    cursor: isUnreadForMe ? 'pointer' : 'default',
                                                    transition: 'background-color 0.2s ease-in-out',
                                                    ...((isUnreadForMe) && {
                                                        p: 1,
                                                        borderRadius: 1,
                                                        bgcolor: 'rgba(0, 0, 0, 0.05)',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0, 0, 0, 0.1)',
                                                        }
                                                    })
                                                }}

                                            >
                                                <Typography sx={{ color: isMine ? 'white' : 'inherit' }}>
                                                    {msg.text}
                                                </Typography>


                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontStyle: 'italic',
                                                        opacity: 0.8,

                                                        ml: 1,
                                                        display: 'block',
                                                        mt: 0.5
                                                    }}
                                                >
                                                </Typography>

                                            </Box>

                                            {/* Footer: Timestamp and Read Receipt */}
                                            <Box
                                                display="flex"
                                                justifyContent="flex-end"
                                                alignItems="center"
                                                sx={{ mt: 0.5 }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: isMine ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                                        mr: 0.5
                                                    }}
                                                >
                                                    {msg.query_created_date
                                                        ? new Date(msg.query_created_date).toLocaleDateString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })
                                                        : ''}
                                                </Typography>

                                                {/* Read Receipt Icons (Only for sender) */}

                                            </Box>
                                        </MessageBubble>
                                    );
                                })}
                            </AnimatePresence>
                        ) : (
                            <Typography color="text.secondary" align="center" mt={5}>
                                No discussion yet. Start the conversation!
                            </Typography>
                        )}

                        {/* Typing Indicator */}
                        <AnimatePresence>
                            {isTyping && (
                                <TypingIndicator
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {[0, 1, 2].map((i) => (
                                        <TypingDot
                                            key={i}
                                            variants={dotVariants}
                                            initial="start"
                                            animate="end"
                                            style={{ animationDelay: `${i * 0.15}s` }}
                                        />
                                    ))}
                                </TypingIndicator>
                            )}
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                    </MessagesContainer>

                    <Divider sx={{ mb: 2 }} />

                    {/* Input Container */}
                    <Box
                        component="form"
                        onSubmit={handleSendMessage}
                        sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                            p: 2
                        }}
                    >
                        {/* Textarea */}
                        <StyledTextField
                            name="answerMessage"
                            placeholder="Write your reply..."
                            value={form.answerMessage}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            minRows={2}
                            maxRows={3}
                            variant="outlined"
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    backgroundColor: '#fff',
                                },
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!showReplyButton}
                            endIcon={<SendIcon sx={{ color: '#fff' }} />}
                            sx={{
                                borderRadius: 2,
                                width: 'fit-content',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                }
                            }}
                        >
                            Reply
                        </Button>
                    </Box>
                </ChatContainer>
            </div>
        </div>
        </>
    );
};

export default ManpowerRequisitionChatBox;
